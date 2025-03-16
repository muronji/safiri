package com.example.safiri.service;

import com.example.safiri.dto.AdminRequest;
import com.example.safiri.dto.AdminResponse;
import com.example.safiri.model.Role;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static com.example.safiri.model.Role.ADMIN;

@RequiredArgsConstructor
@Service
@Slf4j
public class AdminService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminResponse createAdmin(AdminRequest adminRequest) {
        if (userRepository.findByEmail(adminRequest.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin email already registered");
        }

        User admin = new User();
        admin.setName(adminRequest.getName());
        admin.setEmail(adminRequest.getEmail());
        admin.setPassword(passwordEncoder.encode(adminRequest.getPassword()));
        admin.setRole(Role.ADMIN);  // Ensure Role.ADMIN is correctly defined in your enum

        log.info("Creating new admin: {}", admin);
        User savedAdmin = userRepository.save(admin);

        // Return the response DTO
        return new AdminResponse(savedAdmin.getId(), savedAdmin.getEmail(), "ADMIN");
    }


    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(userId);
    }
}
