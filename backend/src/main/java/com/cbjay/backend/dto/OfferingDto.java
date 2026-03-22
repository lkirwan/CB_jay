package com.cbjay.backend.dto;

import java.time.Instant;

public record OfferingDto(
        String id,
        String name,
        String status,
        Instant createdAt,
        Instant startDate,
        Instant closedDate
) {
}

