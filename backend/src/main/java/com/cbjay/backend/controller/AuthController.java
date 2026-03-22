package com.cbjay.backend.controller;

import com.cbjay.backend.dto.AuthRequest;
import com.cbjay.backend.dto.AuthResponse;
import com.cbjay.backend.dto.CurrentUserResponse;
import com.cbjay.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request.password());
    }

    @GetMapping("/me")
    public CurrentUserResponse me(Authentication authentication) {
        return authService.currentUser(authentication.getName());
    }
}

