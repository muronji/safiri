package com.example.safiri.service;

import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final WalletService walletService;
    private final UserRepository userRepository;
    private final TransactionService transactionService;

    @Transactional
    public ResponseEntity<String> processWebhook(String payload, String sigHeader) {
        if (sigHeader == null || sigHeader.isEmpty()) {
            log.error("Stripe-Signature header is missing.");
            return ResponseEntity.badRequest().body("Stripe-Signature header is missing");
        }

        Event event;
        try {
            // Verify webhook signature
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Failed to verify webhook signature: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to verify webhook signature");
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error processing webhook");
        }

        log.info("Received webhook event: {}", event.getType());

        // Handle checkout session completed event
        if ("checkout.session.completed".equals(event.getType())) {
            Optional<? extends com.stripe.model.StripeObject> stripeObjectOpt = event.getDataObjectDeserializer().getObject();

            if (stripeObjectOpt.isPresent() && stripeObjectOpt.get() instanceof Session session) {
                return handleCheckoutSession(session);
            } else {
                log.error("Session data could not be deserialized or is of incorrect type.");
                return ResponseEntity.badRequest().body("Session data could not be deserialized");
            }
        } else {
            log.info("Ignoring event type: {}", event.getType());
            return ResponseEntity.ok("Event ignored");
        }
    }

    private ResponseEntity<String> handleCheckoutSession(Session session) {
        String idStr = session.getMetadata().get("id"); // Now fetching "id"
        String transactionIdStr = session.getMetadata().get("transactionId");

        if (idStr == null || transactionIdStr == null) {
            log.error("Customer ID or Transaction ID is missing from session metadata.");
            return ResponseEntity.badRequest().body("Customer ID or Transaction ID is missing");
        }

        Long id = Long.parseLong(idStr);
        long transactionId;
        try {
            transactionId = Long.parseLong(transactionIdStr);
        } catch (NumberFormatException e) {
            log.error("Invalid Transaction ID format: {}", transactionIdStr);
            return ResponseEntity.badRequest().body("Invalid Transaction ID format");
        }

        Optional<User> customerOpt = userRepository.findById(id);

        if (customerOpt.isPresent()) {
            long amount = session.getAmountTotal();
            walletService.updateWalletBalance(id, amount, true);
            transactionService.updateTransactionStatus(transactionId, "SUCCESS");
            log.info("Successfully updated wallet for customer ID: {} with amount: {}", id, amount);
            return ResponseEntity.ok("Wallet updated successfully");
        } else {
            log.error("Customer with ID {} not found", id);
            return ResponseEntity.badRequest().body("Customer not found");
        }
    }

}