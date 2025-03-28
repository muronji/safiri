package com.example.safiri.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class CurrencyService {

    @Value("${exchange.rate.usd-to-kes}")
    private double usdToKesRate;

    public BigDecimal convertKesToUsd(BigDecimal kesAmount) {
        return kesAmount.divide(BigDecimal.valueOf(usdToKesRate), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal convertUsdToKes(BigDecimal usdAmount) {
        return usdAmount.multiply(BigDecimal.valueOf(usdToKesRate)).setScale(2, RoundingMode.HALF_UP);
    }
} 