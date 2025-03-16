package com.example.safiri.service;

import com.example.safiri.CustomerMapper;
import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.Role;
import com.example.safiri.model.User;
import com.example.safiri.model.Wallet;
import com.example.safiri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class CustomerService implements UserDetailsService {
    private final static String USER_NOT_FOUND_MSG = "User with email %s not found";

    private final UserRepository userRepository;
    private final CustomerMapper customerMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(USER_NOT_FOUND_MSG, email)));
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public CustomerResponse createCustomer(CustomerRequest customerRequest) {
        log.info("Received CustomerRequest: {}", customerRequest);

        if (userRepository.findByEmail(customerRequest.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered");
        }

        User user = customerMapper.toUser(customerRequest);
        log.info("Mapped user entity before saving: {}", user);
        user.setPassword(passwordEncoder.encode(customerRequest.getPassword())); // Encrypt password
        user.setWalletBalance(BigDecimal.ZERO);
        user.setRole(Role.CUSTOMER);

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setWalletBalance(BigDecimal.ZERO);
        user.setWallet(wallet);

        log.info("Saving new customer: {}", user);
        User savedUser = userRepository.save(user); // Persist customer to the DB
        return customerMapper.toCustomerResponse(savedUser);
    }

    public CustomerResponse getCustomerById(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));

        return customerMapper.toCustomerResponse(user);
    }

    public List<CustomerResponse> getAllCustomers() {
        return userRepository.findAll()
                .stream()
                .map(customerMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    public void deleteCustomer(Long customerId) {
        if (userRepository.existsById(customerId)) {
            userRepository.deleteById(customerId);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId);
        }
    }

    public CustomerResponse updateCustomer(Long customerId, CustomerRequest customerRequest) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));

        customerMapper.updateCustomerFromDTO(customerRequest, user);
        User updatedUser = userRepository.save(user);

        return customerMapper.toCustomerResponse(updatedUser);
    }

    public boolean customerExists(Long customerId) {
        return userRepository.existsById(customerId);
    }

    public User getCustomerEntityById(Long customerId) {
        return userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer does not exist"));
    }

    public String getCustomerEmail(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found with ID: " + customerId));
        return user.getEmail();
    }

}
