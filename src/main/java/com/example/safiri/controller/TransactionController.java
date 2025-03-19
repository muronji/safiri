package com.example.safiri.controller;

import com.example.safiri.dto.TransactionDTO;
import com.example.safiri.model.Transaction;
import com.example.safiri.service.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
@AllArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/customer/{Id}")
    public List<Transaction> getTransactionsByCustomerId(@PathVariable Long Id) {
        return transactionService.getTransactionsByCustomerId(Id);
    }
}
