package com.example.safiri.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminResponse {
    private Long id;
    private String email;
    private String role;
}
