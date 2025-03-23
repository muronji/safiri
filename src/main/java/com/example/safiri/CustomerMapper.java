package com.example.safiri;

import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")

public interface CustomerMapper {

    @Mapping(target = "com.example.safiri.User.id", ignore = true) // Ignore ID since it's auto-generated
    @Mapping(target = "com.example.safiri.User.wallet", ignore = true) // Wallet is set separately
    @Mapping(target = "com.example.safiri.User. walletBalance", ignore = true) // Avoid setting walletBalance manually
    @Mapping(target = "password", ignore = true) // Password is encrypted separately
    User toUser(CustomerRequest customerRequest);

    CustomerResponse toCustomerResponse(User user);

    void updateCustomerFromDTO(CustomerRequest customerRequest, @MappingTarget User user);
}
