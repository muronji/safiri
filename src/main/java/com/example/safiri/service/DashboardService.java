package com.example.safiri.service;

import com.example.safiri.dto.DashboardStatistics;
import com.example.safiri.model.Transaction;
import com.example.safiri.repository.TransactionRepository;
import com.example.safiri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public DashboardStatistics getDashboardStatistics() {
        // Total number of customers
        long totalCustomers = userRepository.count();

        // Deposits statistics
        long totalDepositTransactions = transactionRepository.countByTransactionType(Transaction.TransactionType.DEPOSIT);
        BigDecimal totalDepositAmount = transactionRepository.sumAmountByTransactionType(Transaction.TransactionType.DEPOSIT)
                .orElse(BigDecimal.ZERO);

        // Withdrawal statistics
        long totalWithdrawalTransactions = transactionRepository.countByTransactionType(Transaction.TransactionType.WITHDRAWAL);
        BigDecimal totalWithdrawalAmount = transactionRepository.sumAmountByTransactionType(Transaction.TransactionType.WITHDRAWAL)
                .orElse(BigDecimal.ZERO);

        // Success and Failure Rates
        long successfulTransactions = transactionRepository.countByTransactionStatus(Transaction.TransactionStatus.SUCCESS);
        long failedTransactions = transactionRepository.countByTransactionStatus(Transaction.TransactionStatus.FAILED);
        long pendingTransactions = transactionRepository.countByTransactionStatus(Transaction.TransactionStatus.PENDING);

        // Average Transaction Amount
        BigDecimal avgTransactionAmount = calculateAverageTransactionAmount();

        // Most Active Period
        LocalDateTime mostActivePeriod = transactionRepository.findMostActiveTransactionPeriod();

        log.info("Dashboard Statistics generated: Customers={}, Deposits={}, Withdrawals={}",
                totalCustomers, totalDepositTransactions, totalWithdrawalTransactions);

        return DashboardStatistics.builder()
                .totalCustomers(totalCustomers)
                .totalDepositTransactions(totalDepositTransactions)
                .totalDepositAmount(totalDepositAmount)
                .totalWithdrawalTransactions(totalWithdrawalTransactions)
                .totalWithdrawalAmount(totalWithdrawalAmount)
                .successfulTransactions(successfulTransactions)
                .failedTransactions(failedTransactions)
                .pendingTransactions(pendingTransactions)
                .averageTransactionAmount(avgTransactionAmount)
                .mostActiveTransactionPeriod(mostActivePeriod)
                .build();
    }

    private BigDecimal calculateAverageTransactionAmount() {
        BigDecimal totalAmount = transactionRepository.sumAllTransactionAmounts()
                .orElse(BigDecimal.ZERO);
        long totalTransactions = transactionRepository.count();

        return totalTransactions > 0
                ? totalAmount.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
    }
}