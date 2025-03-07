package com.example.safiri.repository;

import com.example.safiri.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerId(Long customerId);

//    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.wallet WHERE c.customerId = :customerId")
//    Optional<Customer> findCustomerWithWallet(@Param("customerId") Long customerId);
//
}
