package com.example.safiri.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UrlConfig {

    @Value("${api.base.url}")
    private String apiBaseUrl;

    public String getApiBaseUrl() {
        return apiBaseUrl;
    }
}

