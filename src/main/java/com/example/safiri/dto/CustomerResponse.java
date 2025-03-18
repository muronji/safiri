package com.example.safiri.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@RequiredArgsConstructor
@AllArgsConstructor
@Data
public class CustomerResponse {
    @JsonProperty("id")
    private Long CustomerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private BigDecimal walletBalance;
    private String identifier;
    private String identifierType;

}
