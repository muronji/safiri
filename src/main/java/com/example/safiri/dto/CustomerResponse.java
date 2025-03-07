package com.example.safiri.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@RequiredArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    @JsonProperty("id")
    private Long CustomerId;
    private String name;
    private String email;
    private BigDecimal walletBalance;
    private String identifier;
    private String identifierType;

    public CustomerResponse(Long customerId, String name, String email, String identifierType, String identifier, Number number) {
    }
}
