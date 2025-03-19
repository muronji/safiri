package com.example.safiri.service;

import com.example.safiri.configuration.MpesaConfiguration;
import com.example.safiri.dto.AccessTokenResponse;
import com.example.safiri.dto.B2CRequest;
import com.example.safiri.dto.B2CSyncResponse;
import com.example.safiri.dto.InternalB2CRequest;
import com.example.safiri.exceptions.MpesaTransactionException;
import com.example.safiri.exceptions.WalletNotFoundException;
import com.example.safiri.model.Transaction;
import com.example.safiri.model.User;
import com.example.safiri.repository.WalletRepository;
import com.example.safiri.util.HelperUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;

@Service
@Slf4j
@RequiredArgsConstructor
public class DarajaApiImplementation implements DarajaApi {

    private final MpesaConfiguration mpesaConfiguration;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final WalletRepository walletRepository;
    private final TransactionService transactionService;

    private static final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");
    private static final String AUTHORIZATION_HEADER_STRING = "Authorization";
    private static final String BEARER_AUTH_STRING = "Bearer";

    @Override
    public AccessTokenResponse getAccessToken() {
        String encodedCredentials = HelperUtility.toBase64(
                mpesaConfiguration.getConsumerKey() + ":" + mpesaConfiguration.getConsumerSecret());

        Request request = new Request.Builder()
                .url(mpesaConfiguration.getOauthEndpoint() + "?grant_type=" + mpesaConfiguration.getGrantType())
                .get()
                .addHeader("Authorization", "Basic " + encodedCredentials)
                .addHeader("Cache-Control", "no-cache")
                .build();

        try (Response response = httpClient.newCall(request).execute();
             ResponseBody responseBody = response.body()) {

            if (responseBody == null) {
                log.error("Response body is null, access token");
                return null;
            }
            return objectMapper.readValue(responseBody.string(), AccessTokenResponse.class);
        } catch (IOException e) {
            log.error("Could not get access token: {}", e.getLocalizedMessage());
            return null;
        }
    }

    @Transactional
    @Override
    public B2CSyncResponse performB2CTransaction(Long customerId, InternalB2CRequest internalB2CRequest) {
        log.info("Incoming InternalB2CRequest from Customer ID {}: {}", customerId, HelperUtility.toJson(internalB2CRequest));

        BigDecimal withdrawalAmount;
        try {
            withdrawalAmount = new BigDecimal(internalB2CRequest.getAmount());
        } catch (NumberFormatException e) {
            log.error("Invalid withdrawal amount for Customer ID {}: {}", customerId, internalB2CRequest.getAmount());
            throw new MpesaTransactionException("Invalid withdrawal amount format");
        }

        // Ensure customer exists and has sufficient balance
        User user = walletRepository.findByUser_Id(customerId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for Customer ID: " + customerId))
                .getUser();

        if (user.getWalletBalance().compareTo(withdrawalAmount) < 0) {
            log.error("Insufficient balance for Customer ID {}: Available {}, Required {}",
                    customerId, user.getWalletBalance(), withdrawalAmount);
            throw new MpesaTransactionException("Insufficient balance for withdrawal");
        }

        log.info("Sufficient balance, proceeding with B2C transaction...");

        // Create a pending transaction
        String txRef = HelperUtility.generateOriginatorConversationID();
        Transaction transaction = transactionService.createPendingTransaction(
                customerId, withdrawalAmount, txRef, Transaction.TransactionType.WITHDRAWAL
        );

        // Get M-Pesa Access Token
        AccessTokenResponse accessTokenResponse = getAccessToken();
        if (accessTokenResponse == null || accessTokenResponse.getAccessToken() == null) {
            log.error("Access token is null");
            throw new MpesaTransactionException("Failed to retrieve access token");
        }

        // Create B2C request
        B2CRequest b2CTransactionRequest = new B2CRequest();
        b2CTransactionRequest.setOriginatorConversationID(txRef);
        b2CTransactionRequest.setCommandID("BusinessPayment");
        b2CTransactionRequest.setAmount(withdrawalAmount.toString());
        b2CTransactionRequest.setPartyB(internalB2CRequest.getPartyB());
        b2CTransactionRequest.setRemarks("Wallet Transfer to " + internalB2CRequest.getPartyB());
        b2CTransactionRequest.setOccassion("Safiri Wallet Payout");
        b2CTransactionRequest.setSecurityCredential(
                HelperUtility.getSecurityCredentials(mpesaConfiguration.getB2cInitiatorPassword())
        );
        b2CTransactionRequest.setResultURL(mpesaConfiguration.getB2cResultUrl());
        b2CTransactionRequest.setQueueTimeOutURL(mpesaConfiguration.getB2cTimeoutUrl());
        b2CTransactionRequest.setInitiatorName(mpesaConfiguration.getB2cInitiatorName());
        b2CTransactionRequest.setPartyA(mpesaConfiguration.getShortCode());

        // Make B2C API Call
        RequestBody body = RequestBody.create(HelperUtility.toJson(b2CTransactionRequest), JSON_MEDIA_TYPE);
        Request request = new Request.Builder()
                .url(mpesaConfiguration.getB2cEndpoint())
                .post(body)
                .addHeader(AUTHORIZATION_HEADER_STRING, BEARER_AUTH_STRING + " " + accessTokenResponse.getAccessToken())
                .build();

        try (Response response = httpClient.newCall(request).execute();
             ResponseBody responseBody = response.body()) {

            if (responseBody == null) {
                log.error("Response body is null");
                throw new MpesaTransactionException("Empty response from M-Pesa");
            }

            String rawResponse = responseBody.string();
            log.info("Raw B2C Response: {}", rawResponse);

            B2CSyncResponse b2CResponse = objectMapper.readValue(rawResponse, B2CSyncResponse.class);
            log.info("B2C Response Parsed: {}", objectMapper.writeValueAsString(b2CResponse));

            log.info("M-Pesa Response Code: {}, Description: {}",
                    b2CResponse.getResponseCode(), b2CResponse.getResponseDescription());

            // Update transaction status based on M-Pesa response
            if ("0".equals(b2CResponse.getResponseCode())) {
                transactionService.updateTransactionOnB2CCallback(txRef, true);
            } else {
                transactionService.updateTransactionOnB2CCallback(txRef, false);
                throw new MpesaTransactionException("M-Pesa B2C transaction failed: " + b2CResponse.getResponseDescription());
            }

            return b2CResponse;
        } catch (IOException e) {
            log.error("Could not perform B2C transaction -> {}", e.getLocalizedMessage());
            transactionService.updateTransactionOnB2CCallback(txRef, false);
            throw new MpesaTransactionException("B2C transaction failed due to network error");
        }
    }
}
