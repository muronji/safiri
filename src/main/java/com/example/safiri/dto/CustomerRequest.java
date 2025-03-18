package com.example.safiri.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;


@Data
@RequiredArgsConstructor
public class CustomerRequest {

        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String identifier;
        private String identifierType;
        private String password;
}

