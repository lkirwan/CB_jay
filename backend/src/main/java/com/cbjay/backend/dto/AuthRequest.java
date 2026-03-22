package com.cbjay.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(@NotBlank String password) {
}

