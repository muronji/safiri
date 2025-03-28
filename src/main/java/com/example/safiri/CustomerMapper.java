package com.example.safiri;

import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerMapper INSTANCE = Mappers.getMapper(CustomerMapper.class);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "walletBalance", source = "walletBalance")
    @Mapping(target = "identifier", source = "identifier")
    @Mapping(target = "identifierType", source = "identifierType")
    CustomerResponse toCustomerResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "wallet", ignore = true)
    @Mapping(target = "walletBalance", ignore = true)
    @Mapping(target = "password", ignore = true)
    User toUser(CustomerRequest customerRequest);

    void updateCustomerFromDTO(CustomerRequest customerRequest, @MappingTarget User user);
}
