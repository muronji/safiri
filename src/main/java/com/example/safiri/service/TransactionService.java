package com.example.safiri.service;

import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import com.example.safiri.model.Transaction;
import com.example.safiri.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerService customerService;

    @Transactional
    public Transaction createPendingTransaction(Long customerId, BigDecimal amount, String txRef, Transaction.TransactionType type) {
        CustomerResponse customerResponse = customerService.getCustomerById(customerId); // Ensure customer exists

        // Convert CustomerResponse to Customer
        User user = new User();
        user.setId(customerResponse.getCustomerId());
        user.setFirstName(customerResponse.getFirstName());
        user.setLastName(customerResponse.getLastName());
        user.setEmail(customerResponse.getEmail());
        user.setPhoneNumber(customerResponse.getPhoneNumber());
        user.setIdentifier(customerResponse.getIdentifier());
        user.setIdentifierType(customerResponse.getIdentifierType());
        user.setWalletBalance(customerResponse.getWalletBalance());
        user.setCreationDate(LocalDateTime.now());
        user.setLastUpdated(LocalDateTime.now());

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setTxRef(txRef);
        transaction.setTransactionType(type);
        transaction.setTransactionStatus(Transaction.TransactionStatus.PENDING); // Initially PENDING
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setLastUpdated(LocalDateTime.now());

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Created PENDING transaction with txRef: {}", txRef);

        return savedTransaction;
    }

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
    public List<Transaction> getTransactionsByCustomerId(Long customerId) {
        return transactionRepository.findByUser_Id(customerId);
    }
}