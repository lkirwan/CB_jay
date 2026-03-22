package com.cbjay.backend.service;

import com.cbjay.backend.dto.AuthResponse;
import com.cbjay.backend.dto.CurrentUserResponse;
import com.cbjay.backend.exception.ApiException;
import com.cbjay.backend.model.FacilitatorAccount;
import com.cbjay.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final FacilitatorAccountService facilitatorAccountService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String facilitatorUsername;

    public AuthService(
            FacilitatorAccountService facilitatorAccountService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.facilitator.username}") String facilitatorUsername
    ) {
        this.facilitatorAccountService = facilitatorAccountService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.facilitatorUsername = facilitatorUsername;
    }

    public AuthResponse login(String password) {
        FacilitatorAccount account = facilitatorAccountService.getRequiredAccount(facilitatorUsername);
        if (!passwordEncoder.matches(password, account.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect password.");
        }

        String token = jwtService.generateToken(account.getUsername(), account.getRole());
        return new AuthResponse(token, account.getUsername(), account.getRole());
    }

    public CurrentUserResponse currentUser(String username) {
        FacilitatorAccount account = facilitatorAccountService.getRequiredAccount(username);
        return new CurrentUserResponse(account.getUsername(), account.getRole());
    }
}


