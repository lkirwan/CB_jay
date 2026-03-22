package com.cbjay.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "4f00b07d89ba18ef7651127ed7959407ea9db5e70d5f4f79344dcdb9a7b4d7fb3d24de3158557189194793349dce5d3e3ee47fe2536daa7f1f9c567a06e5ab0b";

    @Test
    void generatesTokenAndExtractsClaims() {
        JwtService jwtService = new JwtService(SECRET, 10);

        String token = jwtService.generateToken("facilitator", "FACILITATOR");

        assertTrue(jwtService.isValid(token));
        assertEquals("facilitator", jwtService.extractUsername(token));
        assertEquals("FACILITATOR", jwtService.extractRole(token));
    }

    @Test
    void invalidTokenReturnsFalse() {
        JwtService jwtService = new JwtService(SECRET, 10);

        assertFalse(jwtService.isValid("not-a-token"));
    }

    @Test
    void expiredTokenReturnsFalse() {
        JwtService jwtService = new JwtService(SECRET, -1);
        String token = jwtService.generateToken("facilitator", "FACILITATOR");

        assertFalse(jwtService.isValid(token));
    }
}

