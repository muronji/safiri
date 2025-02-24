package com.example.safiri.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private String customerId; // The ID of the wallet owner
    private String currency;
    private Long amount; // Amount in cents
}
