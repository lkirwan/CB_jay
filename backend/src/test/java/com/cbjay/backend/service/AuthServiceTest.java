package com.cbjay.backend.service;

import com.cbjay.backend.dto.AuthResponse;
import com.cbjay.backend.dto.CurrentUserResponse;
import com.cbjay.backend.exception.ApiException;
import com.cbjay.backend.model.FacilitatorAccount;
import com.cbjay.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private FacilitatorAccountService facilitatorAccountService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(facilitatorAccountService, passwordEncoder, jwtService, "facilitator");
    }

    @Test
    void loginReturnsJwtWhenPasswordMatches() {
        FacilitatorAccount account = new FacilitatorAccount();
        account.setUsername("facilitator");
        account.setPasswordHash("hash");
        account.setRole("FACILITATOR");

        when(facilitatorAccountService.getRequiredAccount("facilitator")).thenReturn(account);
        when(passwordEncoder.matches("pw", "hash")).thenReturn(true);
        when(jwtService.generateToken("facilitator", "FACILITATOR")).thenReturn("jwt-token");

        AuthResponse response = authService.login("pw");

        assertEquals("jwt-token", response.token());
        assertEquals("facilitator", response.username());
        assertEquals("FACILITATOR", response.role());
    }

    @Test
    void loginThrowsUnauthorizedForWrongPassword() {
        FacilitatorAccount account = new FacilitatorAccount();
        account.setUsername("facilitator");
        account.setPasswordHash("hash");

        when(facilitatorAccountService.getRequiredAccount("facilitator")).thenReturn(account);
        when(passwordEncoder.matches("bad", "hash")).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> authService.login("bad"));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("Incorrect password.", ex.getMessage());
    }

    @Test
    void currentUserReturnsAccountInfo() {
        FacilitatorAccount account = new FacilitatorAccount();
        account.setUsername("facilitator");
        account.setRole("FACILITATOR");
        when(facilitatorAccountService.getRequiredAccount("facilitator")).thenReturn(account);

        CurrentUserResponse response = authService.currentUser("facilitator");

        verify(facilitatorAccountService).getRequiredAccount("facilitator");
        assertEquals("facilitator", response.username());
        assertEquals("FACILITATOR", response.role());
    }
}

