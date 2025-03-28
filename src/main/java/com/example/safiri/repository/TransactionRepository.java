package com.example.safiri.repository;

import com.example.safiri.model.Transaction;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser_Id(Long id);

    Optional<Transaction> findByTxRef(String sessionId);

    @NotNull
    List<Transaction> findAll();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :id AND t.transactionStatus = 'SUCCESS'")
    BigDecimal findWalletBalanceByUserId(@Param("id") Long id);

    Optional<Transaction> findTopByUser_IdOrderByTransactionDateDesc(Long userId);

    long countByTransactionType(Transaction.TransactionType type);

    long countByTransactionStatus(Transaction.TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.transactionType = :type")
    Optional<BigDecimal> sumAmountByTransactionType(@Param("type") Transaction.TransactionType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t")
    Optional<BigDecimal> sumAllTransactionAmounts();

    @Query("SELECT t.transactionDate FROM Transaction t GROUP BY t.transactionDate ORDER BY COUNT(t) DESC LIMIT 1")
    LocalDateTime findMostActiveTransactionPeriod();

}