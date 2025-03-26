package com.example.safiri.service;

import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.dto.TransactionDTO;
import com.example.safiri.model.User;
import com.example.safiri.model.Transaction;
import com.example.safiri.repository.TransactionRepository;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.repository.WalletRepository;
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
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Transactional
    public Transaction createPendingTransaction(Long customerId, BigDecimal amount, String txRef, Transaction.TransactionType type) {
        // Instead of converting CustomerResponse to User, fetch the actual User entity
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found for Customer ID: " + customerId));

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
    public List<TransactionDTO> getTransactionsByUserId(Long Id) {
        List<Transaction> transactions = transactionRepository.findByUser_Id(Id);
        return transactions.stream()
                .map(tx -> new TransactionDTO(
                        tx.getTxRef(),
                        tx.getAmount(),
                        tx.getTransactionId(),
                        tx.getTransactionType().name(),
                        tx.getTransactionStatus().name(),
                        tx.getTransactionDate()
                ))
                .toList();

    }


    @Transactional
    public void updateTransactionOnB2CCallback(String txRef, boolean isSuccessful) {
        Optional<Transaction> transactionOpt = transactionRepository.findByTxRef(txRef);
        if (transactionOpt.isPresent()) {
            Transaction transaction = transactionOpt.get();
            // Re-fetch the User from the repository to ensure it's managed.
            User user = userRepository.findById(transaction.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found for txRef: " + txRef));

            if (isSuccessful) {
                transaction.setTransactionStatus(Transaction.TransactionStatus.SUCCESS);
                log.info("Before update, user wallet balance: {}", user.getWalletBalance());
                BigDecimal newBalance = user.getWalletBalance().subtract(transaction.getAmount());
                user.setWalletBalance(newBalance);
                log.info("After update, user wallet balance: {}", newBalance);

                // Update the Wallet entity if it exists.
                if (user.getWallet() != null) {
                    user.getWallet().setWalletBalance(newBalance);
                    // Save wallet explicitly if needed.
                    walletRepository.save(user.getWallet());
                    log.info("Wallet entity updated with new balance: {}", newBalance);
                }

                userRepository.save(user);
                userRepository.flush(); // Force flush if necessary
            } else {
                transaction.setTransactionStatus(Transaction.TransactionStatus.FAILED);
            }

            transaction.setLastUpdated(LocalDateTime.now());
            transactionRepository.save(transaction); // Save transaction update
            log.info("Transaction with txRef {} updated based on B2C callback.", txRef);
        } else {
            log.error("Transaction with txRef {} not found for B2C callback.", txRef);
        }
    }

    public List<TransactionDTO> getAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();
        return transactions.stream()
                .map(tx -> new TransactionDTO(
                        tx.getTxRef(),
                        tx.getAmount(),
                        tx.getTransactionId(),
                        tx.getTransactionType().name(),
                        tx.getTransactionStatus().name(),
                        tx.getTransactionDate()
                ))
                .toList();
    }



    @Transactional
    public Transaction handleB2CTransaction(Long customerId, BigDecimal amount, String txRef) {
        return createPendingTransaction(customerId, amount, txRef, Transaction.TransactionType.WITHDRAWAL);
    }

}