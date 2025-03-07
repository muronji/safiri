package com.example.safiri.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class CustomerRequest {

        private String name;
        private String email;
        private String identifier;
        private String identifierType;
}

