package com.cbjay.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRatingRequest(
        @NotBlank String offeringId,
        @Min(1) @Max(5) int score,
        @Size(max = 100) String username,
        @Size(max = 2000) String feedback
) {
}


