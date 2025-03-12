package com.example.safiri.service;

import com.example.safiri.model.Transaction;
import com.example.safiri.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Transactional
    public void updateTransactionStatus(Long transactionId, String status) {
        Optional<Transaction> transactionOpt = transactionRepository.findById(transactionId);

        if (transactionOpt.isPresent()) {
            Transaction transaction = transactionOpt.get();
            transaction.setTransactionStatus(Transaction.TransactionStatus.valueOf(status));
            transactionRepository.save(transaction);
            log.info("Transaction ID {} updated to status: {}", transactionId, status);
        } else {
            log.error("Transaction with ID {} not found", transactionId);
        }
    }
}
