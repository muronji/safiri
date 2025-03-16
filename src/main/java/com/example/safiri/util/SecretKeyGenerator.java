package com.example.safiri.util;

import java.util.Base64;
import java.security.SecureRandom;

public class SecretKeyGenerator {
    public static void main(String[] args) {
        byte[] key = new byte[32]; // 32 bytes = 256 bits
        new SecureRandom().nextBytes(key);
        String secretKey = Base64.getEncoder().encodeToString(key);
        System.out.println("Secret Key: " + secretKey);
    }
}
