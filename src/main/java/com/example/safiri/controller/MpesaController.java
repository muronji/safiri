package com.example.safiri.controller;

import com.example.safiri.dto.*;
import com.example.safiri.service.DarajaApi;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mobile-money")
@RequiredArgsConstructor
@Slf4j
public class MpesaController {

    private final DarajaApi darajaApi;
    private final AcknowledgeResponse acknowledgeResponse;
    private final ObjectMapper objectMapper;

    @GetMapping(path = "/access-token", produces = "application/json")
    public ResponseEntity<AccessTokenResponse> getAccessToken() {
        return ResponseEntity.ok(darajaApi.getAccessToken());
    }

    @PostMapping(path = "/b2c-transaction-result", produces = "application/json")
    public ResponseEntity<AcknowledgeResponse> b2cTransactionAsyncResults(@RequestBody B2CAsyncResponse b2CAsyncResponse)
            throws JsonProcessingException {
        log.info("============B2C Transaction Response============");
        log.info(objectMapper.writeValueAsString(b2CAsyncResponse));
        return ResponseEntity.ok(acknowledgeResponse);
    }

    @PostMapping(path = "/b2c-queue-timeout", produces = "application/json")
    public ResponseEntity<AcknowledgeResponse> queueTimeout(@RequestBody Object object) {
        return ResponseEntity.ok(acknowledgeResponse);
    }

    @PostMapping(path = "/b2c-transaction/{customerId}", produces = "application/json")
    public ResponseEntity<B2CSyncResponse> performB2C(@PathVariable Long customerId, @RequestBody String rawRequest) {
        log.info("Raw JSON Request: {}", rawRequest);

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            InternalB2CRequest request = objectMapper.readValue(rawRequest, InternalB2CRequest.class);
            log.info("Parsed InternalB2CRequest: {}", request);
            return ResponseEntity.ok(darajaApi.performB2CTransaction(customerId, request));
        } catch (Exception e) {
            log.error("Failed to parse JSON: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}