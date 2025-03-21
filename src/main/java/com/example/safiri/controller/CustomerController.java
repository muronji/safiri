package com.example.safiri.controller;

import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:8080", "https://*.ngrok-free.app"})
@RequestMapping("api/v1/users")
public class CustomerController {
    private final CustomerService customerService;
    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCustomer(@RequestBody CustomerRequest customerRequest) {
        try {
            logger.info("Received CustomerRequest: {}", customerRequest);
            CustomerResponse createdCustomer = customerService.createCustomer(customerRequest);

            logger.info("Created CustomerResponse: {}", createdCustomer);
            return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to create customer: {}", e.getMessage());
            return new ResponseEntity<>("Failed to create customer: " + e.getMessage(), HttpStatus.BAD_REQUEST);
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

    @GetMapping("profile/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable("id") Long Id) {
        try {
            CustomerResponse customer = customerService.getCustomerById(Id);
            return new ResponseEntity<>(customer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Customer not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("update/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable("id") Long customerId, @RequestBody CustomerRequest customerRequest) {
        try {
            CustomerResponse updatedCustomer = customerService.updateCustomer(customerId, customerRequest);
            return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update customer: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable("id") Long customerId) {
        try {
            customerService.deleteCustomer(customerId);
            return new ResponseEntity<>("Customer deleted successfully", HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete customer: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


//    @GetMapping("/profile")
//    public ResponseEntity<?> getCustomerProfile() {
//        try {
//            CustomerResponse customerResponse = customerService.getHardcodedCustomer();
//            return ResponseEntity.ok(customerResponse);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
//        }
//    }

}

