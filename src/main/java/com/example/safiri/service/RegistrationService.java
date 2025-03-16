package com.example.safiri.service;

import com.example.safiri.dto.AdminRequest;
import com.example.safiri.dto.CustomerRequest;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RegistrationService {

    private final CustomerService customerService;
    private final EmailValidator emailValidator;
    private final AdminService adminService;

    /**
     * Registers a new customer if the email is valid and not already in use.
     */
    public void register(CustomerRequest request) {
        boolean isValidEmail = emailValidator.test(request.getEmail());
        if (!isValidEmail) {
            throw new IllegalStateException("Email not valid");
        }

        // Check if the customer already exists
        boolean emailExists = customerService.userExistsByEmail(request.getEmail());
        if (emailExists) {
            throw new IllegalStateException("Email already in use");
        }

        // Create the customer
        customerService.createCustomer(request);
    }

    public void registerAdmin(AdminRequest request) {
        boolean isValidEmail = emailValidator.test(request.getEmail());
        if (!isValidEmail) {
            throw new IllegalStateException("Email not valid");
        }

        adminService.createAdmin(request);
    }

}