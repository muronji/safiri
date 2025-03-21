package com.example.safiri.controller;

import com.example.safiri.dto.TransactionDTO;
import com.example.safiri.model.Transaction;
import com.example.safiri.service.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
@CrossOrigin(origins = {"http://localhost:8080", "https://*.ngrok-free.app"})
@AllArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/customer/{Id}")
    public List<Transaction> getTransactionsByCustomerId(@PathVariable Long Id) {
        return transactionService.getTransactionsByCustomerId(Id);
    }
}
