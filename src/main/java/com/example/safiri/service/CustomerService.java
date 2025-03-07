package com.example.safiri.service;

import com.example.safiri.CustomerMapper;
import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.Customer;
import com.example.safiri.model.Wallet;
import com.example.safiri.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerResponse createCustomer(CustomerRequest customerRequest) {
        log.info("Received CustomerRequest: {}", customerRequest);
        Customer customer = customerMapper.toCustomer(customerRequest);

        log.info("Mapped Customer entity: {}", customer);

        if (customer.getEmail() == null || customer.getEmail().isEmpty()) {
            log.error("Email is missing in the customer entity");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        Wallet wallet = new Wallet();
        wallet.setCustomer(customer);
        wallet.setWalletBalance(BigDecimal.ZERO);

        customer.setWalletBalance(BigDecimal.ZERO);
        customer.setWallet(wallet);

        log.info("Saving Customer entity: {}", customer);
        Customer savedCustomer = customerRepository.save(customer);

        log.info("Customer saved with ID: {}", savedCustomer.getCustomerId());
        return customerMapper.toCustomerResponse(savedCustomer);
    }

    public CustomerResponse getCustomerById(Long customerId) {
        log.info("Fetching customer with ID: {}", customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> {
                    log.error("Customer not found with ID: {}", customerId);
                    return new RuntimeException("Customer not found");
                });

        log.info("Found customer: {}", customer);
        return customerMapper.toCustomerResponse(customer);
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    public void deleteCustomer(Long customerId) {
        if (customerRepository.existsById(customerId)) {
            customerRepository.deleteById(customerId);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId);
        }
    }

    public CustomerResponse updateCustomer(Long customerId, CustomerRequest customerRequest) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));
        customerMapper.updateCustomerFromDTO(customerRequest, customer);

        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(updatedCustomer);
    }

    public boolean customerExists(Long customerId) {
        return customerRepository.existsById(customerId);
    }

    public Customer getCustomerEntityById(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer does not exist"));
    }

    public String getCustomerEmail(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));
        return customer.getEmail();
    }

//    public CustomerResponse getHardcodedCustomer() {
//        Long customerId = 1L; // Hardcoded customer ID
//        Customer customer = customerRepository.findCustomerWithWallet(customerId)
//                .orElseThrow(() -> new RuntimeException("Customer not found"));
//
//        return new CustomerResponse(
//                customer.getCustomerId(),
//                customer.getName(),
//                customer.getEmail(),
//                customer.getIdentifierType(),
//                customer.getIdentifier(),
//                customer.getWallet() != null ? customer.getWallet().getWalletBalance() : BigDecimal.ZERO
//        );
//    }
}