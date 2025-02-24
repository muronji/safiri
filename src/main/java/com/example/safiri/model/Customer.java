package com.example.safiri.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Customer {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long customerId; // Database primary key

        @Column(nullable = false)
        private String name;

        @Column(nullable = false, unique = true)
        private String email;

        @Column(nullable = false)
        private String identifier;

        @Column(nullable = false)
        private String identifierType; // Passport or ID number

        @Column(nullable = false)
        private BigDecimal walletBalance;

        @Column(nullable = false, updatable = false)
        private LocalDateTime creationDate;

        @Column(nullable = false)
        private LocalDateTime lastUpdated;

        @OneToOne(fetch = FetchType.LAZY, mappedBy = "customer", cascade = CascadeType.PERSIST)
        private Wallet wallet;

        @PrePersist
        protected void onCreate() {
            this.creationDate = LocalDateTime.now();
            this.lastUpdated = LocalDateTime.now();
        }
}
