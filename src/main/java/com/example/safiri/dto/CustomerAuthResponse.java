package com.example.safiri.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CustomerAuthResponse {
    private CustomerResponse customer;
    private String token;
}
