package com.example.safiri.controller;

import com.example.safiri.dto.PaymentRequest;
import com.example.safiri.dto.StripeResponse;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.service.StripeService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@AllArgsConstructor
public class PaymentCheckoutController {
    private final StripeService stripeService;
    private final UserRepository userRepository;

    @PostMapping("/fund-wallet")
    public ResponseEntity<StripeResponse> fundWallet(@RequestBody PaymentRequest paymentRequest, Authentication authentication) {
        // Extract user ID from the authenticated user
        String userEmail = authentication.getName(); // This is the email or identifier of the authenticated user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        // Set the extracted user ID into the paymentRequest
        paymentRequest.setId(String.valueOf(user.getId()));

        StripeResponse stripeResponse = stripeService.createWalletFundingSession(paymentRequest);
        return ResponseEntity.status(HttpStatus.OK).body(stripeResponse);
    }
}
