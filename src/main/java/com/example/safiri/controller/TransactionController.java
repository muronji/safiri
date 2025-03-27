package com.example.safiri.controller;

import com.example.safiri.dto.TransactionDTO;
import com.example.safiri.dto.TransactionReceipt;
import com.example.safiri.model.Transaction;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.service.TransactionService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
@CrossOrigin(origins = {"http://localhost:8080", "https://*.ngrok-free.app"})
@AllArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @GetMapping("/customer")
    public ResponseEntity<?> getTransactions(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get transactions for this user
        List<TransactionDTO> transactions = transactionService.getTransactionsByUserId(user.getId());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/receipt")
    public ResponseEntity<TransactionReceipt> getLatestReceipt(
            @AuthenticationPrincipal UserDetails userDetails) {

        // Validate user authentication
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Fetch the authenticated user
            String email = userDetails.getUsername();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Generate receipt for the latest transaction
            TransactionReceipt receipt = transactionService.generateLatestTransaction(user);
            return ResponseEntity.ok(receipt);
        } catch (RuntimeException e) {
            log.error("Error generating latest receipt for user {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}