package com.example.safiri.controller;

import com.example.safiri.model.User;
import com.example.safiri.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8080", "https://*.ngrok-free.app"})
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<BigDecimal> getWalletBalance(Authentication authentication) {
        // The principal is a User object, not a Long
        User user = (User) authentication.getPrincipal();

        // Get the ID from the user object
        Long Id = user.getId();

        BigDecimal balance = walletService.getWalletBalance(Id);
        return ResponseEntity.ok(balance);
    }


}
