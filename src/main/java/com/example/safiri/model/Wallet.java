package com.example.safiri.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Data
@Getter
@Setter
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "Id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal walletBalance = BigDecimal.ZERO;
}
