package com.example.safiri.service;

import com.example.safiri.configuration.MpesaConfiguration;
import com.example.safiri.dto.AccessTokenResponse;
import com.example.safiri.dto.B2CRequest;
import com.example.safiri.dto.B2CSyncResponse;
import com.example.safiri.dto.InternalB2CRequest;
import com.example.safiri.util.HelperUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.stereotype.Service;

import java.io.IOException;


@Service
@Slf4j
@Data
public class DarajaApiImplementation implements DarajaApi {

    private final MpesaConfiguration mpesaConfiguration;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    private static final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");
    private static final String AUTHORIZATION_HEADER_STRING = "Authorization";
    private static final String BEARER_AUTH_STRING = "Bearer";

    @Override
    public AccessTokenResponse getAccessToken() {
        String encodedCredentials = HelperUtility.toBase64(String.format("%s:%s",
                mpesaConfiguration.getConsumerKey(), mpesaConfiguration.getConsumerSecret()));

        Request request = new Request.Builder()
                .url(String.format("%s?grant_type=%s", mpesaConfiguration.getOauthEndpoint(),
                        mpesaConfiguration.getGrantType()))
                .get()
                .addHeader("Authorization", String.format("Basic %s", encodedCredentials))
                .addHeader("Cache-Control", "no-cache")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (response.body() == null) {
                log.error("Response body is null1");
                return null;
            }
            return objectMapper.readValue(response.body().string(), AccessTokenResponse.class);
        } catch (Exception e) {
            log.error(String.format("Could not get access token: %s", e.getLocalizedMessage()));
            return null;
        }
    }

    @Override
    public B2CSyncResponse performB2CTransaction(InternalB2CRequest internalB2CRequest) {
        // Log the incoming InternalB2CRequest
        log.info("Incoming InternalB2CRequest: {}", HelperUtility.toJson(internalB2CRequest));

        AccessTokenResponse accessTokenResponse = getAccessToken();
        if (accessTokenResponse == null || accessTokenResponse.getAccessToken() == null) {
            log.error("Access token is null");
            return null;
        }
        log.info("Access Token: {}", accessTokenResponse.getAccessToken());

        B2CRequest b2CTransactionRequest = new B2CRequest();
        b2CTransactionRequest.setCommandID(internalB2CRequest.getCommandID());
        b2CTransactionRequest.setAmount(internalB2CRequest.getAmount());
        b2CTransactionRequest.setPartyB(internalB2CRequest.getPartyB());
        b2CTransactionRequest.setRemarks(internalB2CRequest.getRemarks()); // Ensure this is set
        b2CTransactionRequest.setOccassion(internalB2CRequest.getOccassion());

        // Log the B2CRequest after mapping
        log.info("Mapped B2CRequest: {}", HelperUtility.toJson(b2CTransactionRequest));

        // Set other fields
        b2CTransactionRequest.setSecurityCredential(HelperUtility.getSecurityCredentials(mpesaConfiguration.getB2cInitiatorPassword()));
        b2CTransactionRequest.setResultURL(mpesaConfiguration.getB2cResultUrl());
        b2CTransactionRequest.setQueueTimeOutURL(mpesaConfiguration.getB2cTimeoutUrl());
        b2CTransactionRequest.setInitiatorName(mpesaConfiguration.getB2cInitiatorName());
        b2CTransactionRequest.setPartyA(mpesaConfiguration.getShortCode());

        // Log the final B2CRequest payload
        log.info("Final B2CRequest Payload: {}", HelperUtility.toJson(b2CTransactionRequest));

        // Send the request
        RequestBody body = RequestBody.create(HelperUtility.toJson(b2CTransactionRequest), JSON_MEDIA_TYPE);
        Request request = new Request.Builder()
                .url(mpesaConfiguration.getB2cEndpoint())
                .post(body)
                .addHeader(AUTHORIZATION_HEADER_STRING, String.format("%s %s", BEARER_AUTH_STRING, accessTokenResponse.getAccessToken()))
                .build();

        log.info("Request Headers: {}", request.headers());
        log.info("Request Body: {}", HelperUtility.toJson(b2CTransactionRequest));

        try (Response response = httpClient.newCall(request).execute()) {
            if (response.body() == null) {
                log.error("Response body is null");
                return null;
            }

            String rawResponse = response.body().string();
            log.info("Raw B2C Response: {}", rawResponse);

            B2CSyncResponse b2CResponse = objectMapper.readValue(rawResponse, B2CSyncResponse.class);
            log.info("B2C Response Parsed: {}", objectMapper.writeValueAsString(b2CResponse));

            return b2CResponse;
        } catch (IOException e) {
            log.error("Could not perform B2C transaction -> {}", e.getLocalizedMessage());
            return null;
        }
    }
}