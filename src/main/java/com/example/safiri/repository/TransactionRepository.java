package com.example.safiri.repository;

import com.example.safiri.model.Transaction;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
}