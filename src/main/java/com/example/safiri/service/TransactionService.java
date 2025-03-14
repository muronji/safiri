package com.example.safiri.service;

import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.dto.TransactionDTO;
import com.example.safiri.model.Customer;
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
        Customer customer = new Customer();
        customer.setCustomerId(customerResponse.getCustomerId());
        customer.setName(customerResponse.getName());
        customer.setEmail(customerResponse.getEmail());
        customer.setIdentifier(customerResponse.getIdentifier());
        customer.setIdentifierType(customerResponse.getIdentifierType());
        customer.setWalletBalance(customerResponse.getWalletBalance());
        customer.setCreationDate(LocalDateTime.now());
        customer.setLastUpdated(LocalDateTime.now());

        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
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
        return transactionRepository.findByCustomer_CustomerId(customerId);
    }
}