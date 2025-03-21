package com.example.safiri.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class InternalB2CRequest {
    @JsonProperty("Amount")
    private String amount;

    @JsonProperty("PartyB")
    private String partyB;
}
