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
            return StripeResponse.builder()
                    .status("FAILED")
                    .message("Invalid amount specified")
                    .sessionId(null)
                    .sessionUrl(null)
                    .build();
        }

        long customerId;
        try {
            customerId = Long.parseLong(paymentRequest.getCustomerId());
        } catch (NumberFormatException e) {
            return StripeResponse.builder()
                    .status("FAILED")
                    .message("Invalid customer ID format")
                    .sessionId(null)
                    .sessionUrl(null)
                    .build();
        }

        // Fetch the customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Create product data (Wallet Funding)
        SessionCreateParams.LineItem.PriceData.ProductData productData =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("Wallet Funding for User: " + paymentRequest.getCustomerId())
                        .build();

        // Create price data
        SessionCreateParams.LineItem.PriceData priceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(paymentRequest.getCurrency() != null ? paymentRequest.getCurrency() : "USD")
                        .setUnitAmount(paymentRequest.getAmount()) // Amount in cents
                        .setProductData(productData)
                        .build();

        // Create line item
        SessionCreateParams.LineItem lineItem =
                SessionCreateParams.LineItem.builder()
                        .setQuantity(1L) // Always 1 since it's just a funding transaction
                        .setPriceData(priceData)
                        .build();

        // Create Stripe checkout session for wallet funding
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8080/wallet/success?customerId=" + paymentRequest.getCustomerId())
                .setCancelUrl("http://localhost:8080/wallet/cancel?customerId=" + paymentRequest.getCustomerId())
                .addLineItem(lineItem)
                .putMetadata("customerId", String.valueOf(paymentRequest.getCustomerId())) // Attach customerId
                .build();

        try {
            Session session = Session.create(params);

            // Log pending transaction (before Stripe confirmation)
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTransactionType(Transaction.TransactionType.DEPOSIT);
            transaction.setAmount(BigDecimal.valueOf(paymentRequest.getAmount() / 100.0)); // Convert cents to dollars
            transaction.setTransactionStatus(Transaction.TransactionStatus.PENDING);
            transaction.setTxRef(session.getId());
            transaction.setTransactionDate(LocalDateTime.now());
            transactionRepository.save(transaction);

            return StripeResponse.builder()
                    .status("SUCCESS")
                    .message("Wallet funding session created")
                    .sessionId(session.getId())
                    .sessionUrl(session.getUrl())
                    .build();

        } catch (StripeException e) {
            return StripeResponse.builder()
                    .status("FAILED")
                    .message("Error creating wallet funding session: " + e.getMessage())
                    .sessionId(null)
                    .sessionUrl(null)
                    .build();
        }
    }

    public void handlePaymentSuccess(String sessionId, Long customerId) {
        Stripe.apiKey = secretKey;

        try {
            // Fetch the Stripe session to confirm the payment
            Session session = Session.retrieve(sessionId);

            if (!"complete".equals(session.getStatus())) {
                throw new RuntimeException("Payment not completed");
            }

            // Fetch the customer from the database
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            // Fetch the transaction using sessionId
            Transaction transaction = transactionRepository.findByTxRef(sessionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            // Ensure transaction is still pending
            if (!"PENDING".equals(transaction.getTransactionStatus().name())) {
                throw new RuntimeException("Transaction already processed");
            }

            // Update wallet balance
            BigDecimal newBalance = customer.getWalletBalance().add(transaction.getAmount());
            customer.setWalletBalance(newBalance);
            customerRepository.save(customer);

            // Update transaction status
            transaction.setTransactionStatus(Transaction.TransactionStatus.SUCCESS);
            transactionRepository.save(transaction);

        } catch (StripeException e) {
            throw new RuntimeException("Error verifying payment: " + e.getMessage());
        }
    }

}