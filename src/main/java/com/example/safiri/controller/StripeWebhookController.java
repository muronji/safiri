package com.example.safiri.controller;

import com.example.safiri.model.Customer;
import com.example.safiri.service.WalletService;
import com.example.safiri.repository.CustomerRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.Optional;

@RestController
@RequestMapping("/stripe-webhook")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final WalletService walletService;
    private final CustomerRepository customerRepository;

    @PostMapping("/stripe")
    @Transactional
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader,
            HttpServletRequest request) {

        // Log all headers for debugging
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            log.info("Header: {} = {}", headerName, request.getHeader(headerName));
        }

        if (sigHeader == null || sigHeader.isEmpty()) {
            log.error("Stripe-Signature header is missing.");
            return ResponseEntity.badRequest().body("Stripe-Signature header is missing");
        }

        Event event;

        try {
            // Verify the webhook signature
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Failed to verify webhook signature: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to verify webhook signature");
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error processing webhook");
        }

        log.info("Received webhook event: {}", event.getType());

        // Handle the event based on its type
        if ("checkout.session.completed".equals(event.getType())) {
            Optional<? extends com.stripe.model.StripeObject> stripeObjectOpt = event.getDataObjectDeserializer().getObject();

            if (stripeObjectOpt.isPresent() && stripeObjectOpt.get() instanceof Session) {
                Session session = (Session) stripeObjectOpt.get();
                String customerEmail = session.getCustomerEmail();
                long amountCents = session.getAmountTotal(); // Amount in cents

                if (customerEmail == null) {
                    log.error("Customer email is null in Stripe session.");
                    return ResponseEntity.badRequest().body("Customer email is null");
                }

                // Retrieve customerId using email
                Optional<Long> customerIdOpt = customerRepository.findByEmail(customerEmail).map(Customer::getCustomerId);
                if (customerIdOpt.isPresent()) {
                    Long customerId = customerIdOpt.get();
                    walletService.updateWalletBalance(customerId, amountCents);
                    log.info("Successfully updated wallet for customer ID: {} with amount: {}", customerId, amountCents);
                } else {
                    log.error("Customer with email {} not found", customerEmail);
                    return ResponseEntity.badRequest().body("Customer not found");
                }
            } else {
                log.error("Session data could not be deserialized or is of incorrect type.");
                return ResponseEntity.badRequest().body("Session data could not be deserialized");
            }
        } else {
            log.info("Ignoring event type: {}", event.getType());
            return ResponseEntity.ok("Event ignored");
        }

        return ResponseEntity.ok("Webhook received");
    }
}