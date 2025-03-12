package com.example.safiri.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionDTO {
    private Long customerId;
    private BigDecimal amount;
    private Long transactionId;
    private String transactionType;

}
