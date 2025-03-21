package com.example.safiri.service;

import com.example.safiri.dto.PaymentRequest;
import com.example.safiri.dto.StripeResponse;
import com.example.safiri.model.User;
import com.example.safiri.model.Transaction;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
public class StripeService {

    @Value("${secret-key}")
    private String secretKey;

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public StripeService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public StripeResponse createWalletFundingSession(PaymentRequest paymentRequest) {
        Stripe.apiKey = secretKey;
        System.out.println("Received userId: " + paymentRequest.getId());

        if (paymentRequest.getAmount() == null || paymentRequest.getAmount() <= 0) {
            return new StripeResponse("FAILED", "Invalid amount specified", null, null);
        }

        long id; // Ensure lowercase "id"
        try {
            id = Long.parseLong(paymentRequest.getId());
        } catch (NumberFormatException e) {
            return new StripeResponse("FAILED", "Invalid customer ID format", null, null);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setTransactionType(Transaction.TransactionType.DEPOSIT);
        transaction.setAmount(BigDecimal.valueOf(paymentRequest.getAmount() / 100.0));
        transaction.setTransactionStatus(Transaction.TransactionStatus.PENDING);
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("https://1e83-197-139-54-10.ngrok-free.app/home")
                .setCancelUrl("https://1e83-197-139-54-10.ngrok-free.app/home")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("USD")
                                        .setUnitAmount(paymentRequest.getAmount())
                                        .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName("Wallet Funding")
                                                .build())
                                        .build())
                                .build())
                .putMetadata("id", String.valueOf(id)) // Ensure "id" is consistent in metadata
                .putMetadata("transactionId", String.valueOf(transaction.getTransactionId()))
                .build();

        try {
            Session session = Session.create(params);

            transaction.setTxRef(session.getId());
            transactionRepository.save(transaction);

            log.info("Received payment request: id={}, amount={}", paymentRequest.getId(), paymentRequest.getAmount());
            return new StripeResponse("SUCCESS", "Wallet funding session created", session.getId(), session.getUrl());
        } catch (StripeException e) {
            return new StripeResponse("FAILED", "Error creating session: " + e.getMessage(), null, null);
        }
    }

}