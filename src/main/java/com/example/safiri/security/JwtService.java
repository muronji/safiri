package com.example.safiri.security;

import com.example.safiri.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        System.out.println("🔹 Loaded JWT Secret Key from properties: " + secretKey);
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        signingKey = Keys.hmacShaKeyFor(keyBytes);
        System.out.println("🔹 Secret Key after Decoding: " + signingKey);
    }


    private SecretKey getSigningKey() {
        System.out.println("🔹 Getting Signing Key: " + signingKey);
        return signingKey;
    }

    public String generateToken(User user) {
        System.out.println("🔹 Generating JWT Token for: " + user.getUsername());
        System.out.println("🔹 Using Secret Key for Signing: " + signingKey);
        System.out.println("🔹 Base64 Encoded Secret Key: " + secretKey); // Print the raw secret
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            System.out.println("🔹 Validating JWT Token using Secret Key: " + signingKey);
            System.out.println("🔹 Base64 Encoded Secret Key: " + secretKey);

            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claimsResolver.apply(claims);
        } catch (Exception e) {
            System.out.println("❌ JWT Parsing Error: " + e.getMessage());
            throw e; // Re-throw exception for debugging
        }
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (SignatureException e) {
            System.out.println("❌ Invalid JWT Signature: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.out.println("❌ JWT Token Expired: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("❌ Malformed JWT Token: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ JWT Validation Error: " + e.getMessage());
        }
        return false; // If any exception occurs, the token is invalid
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
