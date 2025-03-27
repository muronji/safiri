package com.example.safiri.dto;

import com.example.safiri.model.Transaction;
import com.example.safiri.model.User;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class TransactionReceipt {
    private String transactionId;
    private String transactionReference;
    private BigDecimal amount;
    private String transactionType;
    private String transactionStatus;
    private LocalDateTime transactionDate;
    private BigDecimal previousBalance;
    private BigDecimal currentBalance;
    private String formattedTransactionDate;
    private String additionalDetails;

    public TransactionReceipt(Transaction transaction, User user) {
        this.transactionId = transaction.getTransactionId().toString();
        this.transactionReference = transaction.getTxRef();
        this.amount = transaction.getAmount();
        this.transactionType = transaction.getTransactionType().name();
        this.transactionStatus = transaction.getTransactionStatus().name();
        this.transactionDate = transaction.getTransactionDate();
        this.formattedTransactionDate = transaction.getTransactionDate()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        // Calculate balances
        this.currentBalance = user.getWalletBalance();
        this.previousBalance = calculatePreviousBalance(transaction, user);

        // Set additional details based on transaction type
        this.additionalDetails = generateAdditionalDetails(transaction);
    }

    private BigDecimal calculatePreviousBalance(Transaction transaction, User user) {
        // For deposit, subtract the amount
        if (transaction.getTransactionType() == Transaction.TransactionType.DEPOSIT) {
            return user.getWalletBalance().subtract(transaction.getAmount());
        }
        // For withdrawal, add the amount back
        if (transaction.getTransactionType() == Transaction.TransactionType.WITHDRAWAL) {
            return user.getWalletBalance().add(transaction.getAmount());
        }
        return user.getWalletBalance();
    }

    private String generateAdditionalDetails(Transaction transaction) {
        return switch (transaction.getTransactionType()) {
            case DEPOSIT -> "Wallet Funding via Stripe";
            case WITHDRAWAL -> "B2C Withdrawal to Mobile Number";
            default -> "Transaction Details";
        };
    }
}
