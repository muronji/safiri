package com.example.safiri.service;

import com.example.safiri.model.Customer;
import com.example.safiri.model.Wallet;
import com.example.safiri.repository.CustomerRepository;
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
    private final CustomerRepository customerRepository;

    // Get or create a wallet for a customer
    public Wallet getOrCreateWallet(Long customerId) {
        return walletRepository.findByCustomer_CustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Customer not found"));

                    Wallet newWallet = new Wallet();
                    newWallet.setCustomer(customer);
                    newWallet.setWalletBalance(BigDecimal.ZERO);

                    log.info("Creating new wallet for customer ID: {}", customerId);
                    return walletRepository.save(newWallet);
                });
    }

    // Update wallet balance (handles both deposits and withdrawals)
    @Transactional
    public void updateWalletBalance(Long customerId, long amountCents, boolean isDeposit) {
        Wallet wallet = getOrCreateWallet(customerId);
        Customer customer = wallet.getCustomer();

        BigDecimal amount = BigDecimal.valueOf(amountCents).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP); // Convert cents to main currency
        BigDecimal newBalance = wallet.getWalletBalance();

        // If it's a deposit, add the amount to the wallet balance
        if (isDeposit) {
            newBalance = newBalance.add(amount);
            log.info("Deposit of {} for customer ID: {}", amount, customerId);
        } else { // If it's a withdrawal, subtract the amount
            newBalance = newBalance.subtract(amount);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient funds for withdrawal.");
            }
            log.info("Withdrawal of {} for customer ID: {}", amount, customerId);
        }

        // Update wallet and customer balance
        wallet.setWalletBalance(newBalance);
        walletRepository.save(wallet);

        customer.setWalletBalance(newBalance);
        customerRepository.save(customer);

        log.info("Wallet updated for customer ID: {}. New balance: {}", customerId, newBalance);
    }

    // Get wallet balance for a customer
    public BigDecimal getWalletBalance(Long customerId) {
        return getOrCreateWallet(customerId).getWalletBalance();
    }
}
