package com.example.safiri.service;

import com.example.safiri.dto.AccessTokenResponse;
import com.example.safiri.dto.B2CSyncResponse;
import com.example.safiri.dto.InternalB2CRequest;

public interface DarajaApi {

    AccessTokenResponse getAccessToken();

    B2CSyncResponse performB2CTransaction(Long Id, InternalB2CRequest internalB2CRequest);

}