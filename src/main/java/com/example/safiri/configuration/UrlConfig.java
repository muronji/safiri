package com.example.safiri.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class UrlConfig {

    @Value("${api.base.url}")
    private String apiBaseUrl;

}

