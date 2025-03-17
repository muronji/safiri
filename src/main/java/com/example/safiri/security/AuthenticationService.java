package com.example.safiri.security;

import com.example.safiri.dto.AuthResponse;
import com.example.safiri.dto.LoginRequest;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.security.JwtService;
import com.example.safiri.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CustomerService customerService;

    public AuthResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserDetails userDetails = customerService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails); // Generating token using UserDetails

        return new AuthResponse(token);
    }
}