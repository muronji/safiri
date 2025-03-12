package com.example.safiri.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InternalB2CRequest {
    @JsonProperty("Remarks")
    private String remarks;

    @JsonProperty("Amount")
    private BigDecimal amount;

    @JsonProperty("Occassion")
    private String occassion;

    @JsonProperty("CommandID")
    private String commandID;

    @JsonProperty("PartyB")
    private String partyB;
}

