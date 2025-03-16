package com.example.safiri;

import com.example.safiri.dto.CustomerRequest;
import com.example.safiri.dto.CustomerResponse;
import com.example.safiri.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface CustomerMapper {

    User toUser(CustomerRequest customerRequest);

    CustomerResponse toCustomerResponse(User user);

    void updateCustomerFromDTO(CustomerRequest customerRequest, @MappingTarget User user);
}

