package com.cbjay.backend.dto;

import java.time.Instant;

public record RatingDto(
        String id,
        String offeringId,
        int score,
        String username,
        Instant createdAt
) {
}

