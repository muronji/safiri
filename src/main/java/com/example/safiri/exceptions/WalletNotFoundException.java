package com.example.safiri.exceptions;

public class WalletNotFoundException extends RuntimeException     {
    public WalletNotFoundException(String message) {
        super(message);
    }
}


