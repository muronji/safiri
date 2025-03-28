package com.example.safiri.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DashboardStatistics {
    private long totalCustomers;

    private long totalDepositTransactions;
    private BigDecimal totalDepositAmount;

    private long totalWithdrawalTransactions;
    private BigDecimal totalWithdrawalAmount;

    private long successfulTransactions;
    private long failedTransactions;
    private long pendingTransactions;

    private BigDecimal averageTransactionAmount;

    private LocalDateTime mostActiveTransactionPeriod;
}
