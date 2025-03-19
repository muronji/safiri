package com.example.safiri;

import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;


@Mapper(componentModel = "spring")
public interface CustomerMapper {

    User toUser(CustomerRequest customerRequest);

    CustomerResponse toCustomerResponse(User user);

    void updateCustomerFromDTO(CustomerRequest customerRequest, @MappingTarget User user);

    // Add a default method to check mapping
    default CustomerResponse mapToResponse(User user) {
        if (user == null) return null;

        return new CustomerResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getWallet() != null ? user.getWallet().getWalletBalance() : BigDecimal.ZERO,
                user.getIdentifier(),
                user.getIdentifierType()
        );
    }
}
