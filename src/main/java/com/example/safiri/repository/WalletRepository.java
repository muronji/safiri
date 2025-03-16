package com.example.safiri.repository;

import com.example.safiri.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser_Email(String email);

    Optional<Wallet> findByUser_Id(Long Id);
}