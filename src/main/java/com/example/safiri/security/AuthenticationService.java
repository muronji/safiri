package com.example.safiri.security;

import com.example.safiri.dto.AuthResponse;
import com.example.safiri.dto.LoginRequest;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse authenticate(LoginRequest request, HttpServletResponse response) {
        // Always authenticate with the provided credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Clear any existing authentication before setting the new one
        SecurityContextHolder.clearContext();

        // Set the new authentication
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate new tokens
        jwtService.generateAndSetTokens(response, user);

        return new AuthResponse(jwtService.generateToken(user, 1000 * 60 * 60), user);
    }
}
