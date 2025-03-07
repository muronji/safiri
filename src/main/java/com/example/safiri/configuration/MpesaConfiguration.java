package com.example.safiri.configuration;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class MpesaConfiguration {

    @Value("${mpesa.consumer-key}")
    private String consumerKey;

    @Value("${mpesa.consumer-secret}")
    private String consumerSecret;

    @Value("${mpesa.grant-type}")
    private String grantType;

    @Value("${mpesa.oauth-endpoint}")
    private String oauthEndpoint;

    @Value("${mpesa.b2c-endpoint}")
    private String b2cEndpoint;

    @Value("${mpesa.b2c-timeout-url}")
    private String b2cTimeoutUrl;

    @Value("${mpesa.b2c-result-url}")
    private String b2cResultUrl;

    @Value("${mpesa.b2c-initiator-name}")
    private String b2cInitiatorName;

    @Value("${mpesa.b2c-initiator-password}")
    private String b2cInitiatorPassword;

    @Value("${mpesa.short-code}")
    private String ShortCode;

    @Override
    public String toString() {
        return String.format("{consumerKey: %s, consumerSecret: %s, grantType: %s, oauthEndpoint: %s}",
                consumerKey, consumerSecret, grantType, oauthEndpoint);
    }
}
