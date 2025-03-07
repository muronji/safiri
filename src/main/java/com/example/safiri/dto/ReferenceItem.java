package com.example.safiri.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReferenceItem {
    @JsonProperty("Value")
    private String value;

    @JsonProperty("Key")
    private String key;
}
