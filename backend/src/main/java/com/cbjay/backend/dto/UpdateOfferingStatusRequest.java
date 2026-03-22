package com.cbjay.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOfferingStatusRequest(@NotBlank String status) {
}

