package com.example.safiri.controller;

import com.example.safiri.dto.*;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.service.DarajaApi;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mobile-money")
@RequiredArgsConstructor
@Slf4j
public class MpesaController {

    private final DarajaApi darajaApi;
    private final AcknowledgeResponse acknowledgeResponse;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    @GetMapping("/access-token")
    public ResponseEntity<AccessTokenResponse> getAccessToken() {
        return ResponseEntity.ok(darajaApi.getAccessToken());
    }

    @PostMapping("/b2c-transaction-result")
    public ResponseEntity<AcknowledgeResponse> b2cTransactionAsyncResults(@RequestBody B2CAsyncResponse b2CAsyncResponse)
            throws JsonProcessingException {
        log.info("============B2C Transaction Response============");
        log.info(objectMapper.writeValueAsString(b2CAsyncResponse));
        return ResponseEntity.ok(acknowledgeResponse);
    }

    @PostMapping("/b2c-queue-timeout")
    public ResponseEntity<AcknowledgeResponse> queueTimeout(@RequestBody Object object) {
        return ResponseEntity.ok(acknowledgeResponse);
    }

    @PostMapping("/b2c-transaction")
    public ResponseEntity<B2CSyncResponse> performB2C(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody InternalB2CRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = userDetails.getUsername();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Long userId = user.getId();
        log.info("Authenticated user: {} (ID: {})", userEmail, userId);
        log.info("Received B2C Transaction Request: {}", request);

        B2CSyncResponse response = darajaApi.performB2CTransaction(userId, request);
        return ResponseEntity.ok(response);
    }
}
