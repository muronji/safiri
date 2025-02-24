package com.example.safiri.controller;

import com.example.safiri.dto.PaymentRequest;
import com.example.safiri.dto.StripeResponse;
import com.example.safiri.service.StripeService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
@AllArgsConstructor
public class PaymentCheckoutController {
    private final StripeService stripeService;

    @PostMapping("/fund-wallet")
    public ResponseEntity<StripeResponse> fundWallet(@RequestBody PaymentRequest paymentRequest) {
        StripeResponse stripeResponse = stripeService.createWalletFundingSession(paymentRequest);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(stripeResponse);
    }
}
