package com.example.safiri.controller;

import com.example.safiri.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance/{Id}")
    public ResponseEntity<BigDecimal> getWalletBalance(@PathVariable Long Id) {
        BigDecimal balance = walletService.getWalletBalance(Id);
        return ResponseEntity.ok(balance);
    }


}
