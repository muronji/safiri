package com.example.safiri.controller;

import com.example.safiri.dto.CustomerAuthResponse;
import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import com.example.safiri.repository.UserRepository;
import com.example.safiri.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:8080", "https://*.ngrok-free.app"})
@RequestMapping("api/v1/users")
@Slf4j
public class CustomerController {
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);


    public CustomerController(CustomerService customerService, UserRepository userRepository) {
        super();
        this.customerService = customerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<CustomerAuthResponse> createCustomer(@RequestBody CustomerRequest customerRequest) {
        try {
            CustomerAuthResponse response = customerService.createCustomer(customerRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to create customer: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<CustomerResponse> customers = customerService.getAllCustomers();
            return new ResponseEntity<>(customers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to retrieve customers: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCustomerProfile() {
        try {
            // Get the authenticated user's email from the SecurityContext (set by JwtAuthenticationFilter)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName(); // This will be the user's email from the JWT

            // Use the email to fetch the customer details
            CustomerResponse customer = customerService.getCustomerByEmail(email);
            // Log the email obtained from the JWT token
            log.info("Email from JWT Token: {}", email);
            return new ResponseEntity<>(customer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Customer not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }


    @PutMapping("update/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable("id") Long customerId, @RequestBody CustomerRequest customerRequest) {
        try {
            // Get the authenticated user's email from the SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            // Get the customer to be updated
            User userToUpdate = userRepository.findById(customerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));

            // Verify that the authenticated user is updating their own profile
            if (!userToUpdate.getEmail().equals(email)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
            }

            // Update the customer details
            CustomerResponse updatedCustomer = customerService.updateCustomerByEmail(email, customerRequest);
            return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(e.getMessage(), e.getStatusCode());
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update customer: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable("id") Long customerId) {
        try {
            // Get the authenticated user's email from the SecurityContext (set by JwtAuthenticationFilter)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName(); // This will be the user's email from the JWT

            // Log the email obtained from the JWT token
            log.info("Email from JWT Token: {}", email);

            // Use the email to delete the customer associated with the authenticated user
            customerService.deleteCustomerByEmail(email);
            return new ResponseEntity<>("Customer deleted successfully", HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete customer: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


}

