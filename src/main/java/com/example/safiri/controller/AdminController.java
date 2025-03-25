package com.example.safiri.controller;

import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final CustomerService customerService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<CustomerResponse> customers = customerService.getAllCustomers();
            return new ResponseEntity<>(customers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to retrieve customers: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
