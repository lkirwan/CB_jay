package com.cbjay.backend.controller;

import com.cbjay.backend.dto.CreateOfferingRequest;
import com.cbjay.backend.dto.OfferingDto;
import com.cbjay.backend.dto.UpdateOfferingStatusRequest;
import com.cbjay.backend.service.OfferingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class OfferingController {

    private final OfferingService offeringService;

    public OfferingController(OfferingService offeringService) {
        this.offeringService = offeringService;
    }

    @GetMapping("/api/public/offerings")
    public List<OfferingDto> getActiveOfferings() {
        return offeringService.getActiveOfferings();
    }

    @GetMapping("/api/offerings")
    public List<OfferingDto> getAllOfferings() {
        return offeringService.getAllOfferings();
    }

    @PostMapping("/api/offerings")
    public OfferingDto createOffering(@Valid @RequestBody CreateOfferingRequest request) {
        return offeringService.createOffering(request);
    }

    @PatchMapping("/api/offerings/{id}/status")
    public OfferingDto updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateOfferingStatusRequest request) {
        return offeringService.updateStatus(id, request.status());
    }
}

