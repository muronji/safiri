package com.example.safiri.controller;

import com.example.safiri.dto.TransactionDTO;
import com.example.safiri.model.Transaction;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.service.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
@CrossOrigin(origins = {"http://localhost:8080", "https://*.ngrok-free.app"})
@AllArgsConstructor
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
}