package com.example.safiri.service;


import com.example.safiri.dto.PaymentRequest;
import com.example.safiri.dto.StripeResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${secret-key}")
    private String secretKey;

    public StripeResponse createWalletFundingSession(PaymentRequest paymentRequest) {
        Stripe.apiKey = secretKey;

        // Ensure valid input
        if (paymentRequest.getAmount() == null || paymentRequest.getAmount() <= 0) {
            return StripeResponse.builder()
                    .status("FAILED")
                    .message("Invalid amount specified")
                    .sessionId(null)
                    .sessionUrl(null)
                    .build();
        }

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
                .putMetadata("customerId", paymentRequest.getCustomerId()) // Attach customerId
                .build();


        try {
            Session session = Session.create(params);

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


}
