package com.example.safiri.repository;

import com.example.safiri.model.Transaction;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser_Id(Long customerId);
    boolean existsByTransactionId(Long TransactionId);
    Transaction findByTransactionId(Long transactionId);

    Optional<Transaction> findByTxRef(String sessionId);

    @NotNull
    List<Transaction> findAll();
}
