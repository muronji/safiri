package com.example.safiri.service;

import com.example.safiri.dto.B2CSyncResponse;
import com.example.safiri.dto.InternalB2CRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
@RequiredArgsConstructor
public class MoneyTransferService {
    private final DarajaApi darajaApi;
    private final CurrencyService currencyService;

    @Transactional
    public B2CSyncResponse transferMoney(Long customerId, InternalB2CRequest request) {
        log.info("Processing money transfer request in KES: {}", request.getAmount());

        // Convert KES amount to USD for wallet balance check
        BigDecimal kesAmount = new BigDecimal(request.getAmount());
        BigDecimal usdAmount = currencyService.convertKesToUsd(kesAmount);

        // Create a new request with the USD amount for wallet balance check
        InternalB2CRequest usdRequest = new InternalB2CRequest();
        usdRequest.setAmount(usdAmount.toString()); // Use USD amount for wallet balance check
        usdRequest.setPartyB(request.getPartyB());

        // Perform the actual B2C transaction with USD amount
        return darajaApi.performB2CTransaction(customerId, usdRequest);
    }
}
