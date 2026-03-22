package com.cbjay.backend.service;

import com.cbjay.backend.dto.CreateOfferingRequest;
import com.cbjay.backend.dto.OfferingDto;
import com.cbjay.backend.exception.ApiException;
import com.cbjay.backend.model.Offering;
import com.cbjay.backend.model.OfferingStatus;
import com.cbjay.backend.repository.OfferingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class OfferingService {

    private final OfferingRepository offeringRepository;

    public OfferingService(OfferingRepository offeringRepository) {
        this.offeringRepository = offeringRepository;
    }

    public List<OfferingDto> getAllOfferings() {
        return offeringRepository.findAll().stream()
                .sorted(Comparator.comparing(Offering::getCreatedAt).reversed())
                .map(this::toDto)
                .toList();
    }

    public List<OfferingDto> getActiveOfferings() {
        return offeringRepository.findAll().stream()
                .filter(offering -> offering.getStatus() == OfferingStatus.ACTIVE)
                .sorted(Comparator.comparing(Offering::getStartDate).reversed())
                .map(this::toDto)
                .toList();
    }

    public OfferingDto createOffering(CreateOfferingRequest request) {
        Instant now = Instant.now();
        Offering offering = new Offering();
        offering.setId(UUID.randomUUID());
        offering.setName(request.name().trim());
        offering.setStatus(OfferingStatus.ACTIVE);
        offering.setCreatedAt(now);
        offering.setStartDate(now);
        offering.setClosedDate(null);
        return toDto(offeringRepository.save(offering));
    }

    public OfferingDto updateStatus(UUID id, String requestedStatus) {
        Offering offering = offeringRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Offering not found."));

        OfferingStatus status;
        try {
            status = OfferingStatus.valueOf(requestedStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid offering status.");
        }

        Instant now = Instant.now();
        if (status == OfferingStatus.CLOSED) {
            offering.setStatus(OfferingStatus.CLOSED);
            offering.setClosedDate(now);
        } else {
            offering.setStatus(OfferingStatus.ACTIVE);
            offering.setStartDate(now);
        }

        return toDto(offeringRepository.save(offering));
    }

    public Offering getRequiredActiveOffering(UUID id) {
        Offering offering = offeringRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Offering not found."));

        if (offering.getStatus() != OfferingStatus.ACTIVE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This offering is closed and cannot accept ratings.");
        }

        return offering;
    }

    private OfferingDto toDto(Offering offering) {
        return new OfferingDto(
                offering.getId().toString(),
                offering.getName(),
                offering.getStatus().name().toLowerCase(),
                offering.getCreatedAt(),
                offering.getStartDate(),
                offering.getClosedDate()
        );
    }
}

