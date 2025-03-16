package com.example.safiri.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class CustomerRequest {

        private String name;
        private String email;
        private String identifier;
        private String identifierType;
        private String password;
}

