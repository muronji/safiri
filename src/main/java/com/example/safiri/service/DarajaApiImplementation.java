package com.example.safiri.service;

import com.example.safiri.configuration.MpesaConfiguration;
import com.example.safiri.dto.AccessTokenResponse;
import com.example.safiri.dto.B2CRequest;
import com.example.safiri.dto.B2CSyncResponse;
import com.example.safiri.dto.InternalB2CRequest;
import com.example.safiri.exceptions.MpesaTransactionException;
import com.example.safiri.exceptions.WalletNotFoundException;
import com.example.safiri.model.Customer;
import com.example.safiri.model.Transaction;
import com.example.safiri.model.Wallet;
import com.example.safiri.repository.TransactionRepository;
import com.example.safiri.repository.WalletRepository;
import com.example.safiri.util.HelperUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
@Data
public class DarajaApiImplementation implements DarajaApi {

    private final MpesaConfiguration mpesaConfiguration;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

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

        Wallet wallet = walletRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for Customer ID: " + customerId));

        BigDecimal withdrawalAmount = new BigDecimal(internalB2CRequest.getAmount());
        if (withdrawalAmount == null) {
            log.error("Withdrawal amount is missing in the request for Customer ID: {}", customerId);
            throw new MpesaTransactionException("Withdrawal amount cannot be null");
        }

        if (wallet.getWalletBalance().compareTo(withdrawalAmount) < 0) {
            log.error("Insufficient balance for Customer ID {}: Available {}, Required {}",
                    customerId, wallet.getWalletBalance(), withdrawalAmount);
            throw new MpesaTransactionException("Insufficient balance for withdrawal");
        }

        log.info("Sufficient balance, proceeding with B2C transaction...");

        AccessTokenResponse accessTokenResponse = getAccessToken();
        if (accessTokenResponse == null || accessTokenResponse.getAccessToken() == null) {
            log.error("Access token is null");
            throw new MpesaTransactionException("Failed to retrieve access token");
        }

        B2CRequest b2CTransactionRequest = new B2CRequest();
        b2CTransactionRequest.setOriginatorConversationID(HelperUtility.generateOriginatorConversationID());
        b2CTransactionRequest.setCommandID(internalB2CRequest.getCommandID());
        b2CTransactionRequest.setAmount(withdrawalAmount.toString());
        b2CTransactionRequest.setPartyB(internalB2CRequest.getPartyB());
        b2CTransactionRequest.setRemarks(internalB2CRequest.getRemarks());
        b2CTransactionRequest.setOccassion(internalB2CRequest.getOccassion());

        b2CTransactionRequest.setSecurityCredential(HelperUtility.getSecurityCredentials(mpesaConfiguration.getB2cInitiatorPassword()));
        b2CTransactionRequest.setResultURL(mpesaConfiguration.getB2cResultUrl());
        b2CTransactionRequest.setQueueTimeOutURL(mpesaConfiguration.getB2cTimeoutUrl());
        b2CTransactionRequest.setInitiatorName(mpesaConfiguration.getB2cInitiatorName());
        b2CTransactionRequest.setPartyA(mpesaConfiguration.getShortCode());

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

            if ("0".equals(b2CResponse.getResponseCode())) {
                wallet.setWalletBalance(wallet.getWalletBalance().subtract(withdrawalAmount));
                walletRepository.save(wallet);
                log.info("Wallet balance updated successfully for Customer ID: {}", customerId);
                logTransaction(customerId, withdrawalAmount, b2CResponse.getOriginatorConversationID());
            } else {
                log.error("B2C Transaction failed. No deduction from wallet.");
                throw new MpesaTransactionException("M-Pesa B2C transaction failed: " + b2CResponse.getResponseDescription());
            }
            return b2CResponse;
        } catch (IOException e) {
            log.error("Could not perform B2C transaction -> {}", e.getLocalizedMessage());
            throw new MpesaTransactionException("B2C transaction failed due to network error");
        }
    }

    private void logTransaction(Long customerId, BigDecimal amount, String originatorConversationID) {
        Wallet wallet = walletRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new WalletNotFoundException("Customer not found"));
        Customer customer = wallet.getCustomer();

        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
        transaction.setTxRef(originatorConversationID);
        transaction.setAmount(amount);
        transaction.setTransactionType(Transaction.TransactionType.WITHDRAWAL);
        transaction.setTransactionStatus(Transaction.TransactionStatus.SUCCESS);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setLastUpdated(LocalDateTime.now());

        transactionRepository.save(transaction);
        log.info("Transaction logged successfully for Customer ID: {}", customerId);
    }
}