package com.example.safiri.service;

import com.example.safiri.dto.PaymentRequest;
import com.example.safiri.dto.StripeResponse;
import com.example.safiri.model.Customer;
import com.example.safiri.model.Transaction;
import com.example.safiri.repository.CustomerRepository;
import com.example.safiri.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class StripeService {

    @Value("${secret-key}")
    private String secretKey;

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public StripeService(CustomerRepository customerRepository, TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    public StripeResponse createWalletFundingSession(PaymentRequest paymentRequest) {
        Stripe.apiKey = secretKey;

        if (paymentRequest.getAmount() == null || paymentRequest.getAmount() <= 0) {
            return new StripeResponse("FAILED", "Invalid amount specified", null, null);
        }

        long customerId;
        try {
            customerId = Long.parseLong(paymentRequest.getCustomerId());
        } catch (NumberFormatException e) {
            return new StripeResponse("FAILED", "Invalid customer ID format", null, null);
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
        transaction.setTransactionType(Transaction.TransactionType.DEPOSIT);
        transaction.setAmount(BigDecimal.valueOf(paymentRequest.getAmount() / 100.0));
        transaction.setTransactionStatus(Transaction.TransactionStatus.PENDING);
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8080/wallet/success")
                .setCancelUrl("http://localhost:8080/wallet/cancel")
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
                .putMetadata("customerId", String.valueOf(customerId))
                .putMetadata("transactionId", String.valueOf(transaction.getTransactionId()))
                .build();

        try {
            Session session = Session.create(params);

            transaction.setTxRef(session.getId());
            transactionRepository.save(transaction);

            return new StripeResponse("SUCCESS", "Wallet funding session created", session.getId(), session.getUrl());
        } catch (StripeException e) {
            return new StripeResponse("FAILED", "Error creating session: " + e.getMessage(), null, null);
        }
    }
}