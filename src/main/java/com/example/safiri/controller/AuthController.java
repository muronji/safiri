package com.example.safiri.controller;

import com.example.safiri.dto.AdminRequest;
import com.example.safiri.dto.AuthResponse;
import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.LoginRequest;
import com.example.safiri.security.AuthenticationService;
import com.example.safiri.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final RegistrationService registrationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody CustomerRequest request) {
        registrationService.register(request);
        return ResponseEntity.ok("Registration successful.");
    }

    @PostMapping("register-admin")
    public ResponseEntity<String> registerAdmin(@RequestBody AdminRequest request) {
        System.out.println("🚀 Registration endpoint hit!");
        registrationService.registerAdmin(request);
        return ResponseEntity.ok("Admin registration successful.");
    }

}
