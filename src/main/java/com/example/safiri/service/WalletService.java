package com.example.safiri.service;

import com.example.safiri.model.User;
import com.example.safiri.model.Wallet;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    // Get or create a wallet for a customer
    public Wallet getOrCreateWallet(Long Id) {
        return walletRepository.findByUser_Id(Id)
                .orElseGet(() -> {
                    User user = userRepository.findById(Id)
                            .orElseThrow(() -> new RuntimeException("Customer not found"));

                    Wallet newWallet = new Wallet();
                    newWallet.setUser(user);
                    newWallet.setWalletBalance(BigDecimal.ZERO);

                    log.info("Creating new wallet for customer ID: {}", Id);
                    return walletRepository.save(newWallet);
                });
    }

    // Update wallet balance (handles both deposits and withdrawals)
    @Transactional
    public void updateWalletBalance(Long Id, long amountCents, boolean isDeposit) {
        Wallet wallet = getOrCreateWallet(Id);
        User user = wallet.getUser();

        BigDecimal amount = BigDecimal.valueOf(amountCents).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP); // Convert cents to main currency
        BigDecimal newBalance = wallet.getWalletBalance();

        // If it's a deposit, add the amount to the wallet balance
        if (isDeposit) {
            newBalance = newBalance.add(amount);
            log.info("Deposit of {} for customer ID: {}", amount, Id);
        } else { // If it's a withdrawal, subtract the amount
            newBalance = newBalance.subtract(amount);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient funds for withdrawal.");
            }
            log.info("Withdrawal of {} for customer ID: {}", amount, Id);
        }

        // Update wallet and customer balance
        wallet.setWalletBalance(newBalance);
        walletRepository.save(wallet);

        user.setWalletBalance(newBalance);
        userRepository.save(user);

        log.info("Wallet updated for customer ID: {}. New balance: {}", Id, newBalance);
    }

    // Get wallet balance for a customer
    public BigDecimal getWalletBalance(Long Id) {
        return getOrCreateWallet(Id).getWalletBalance();
    }
}
