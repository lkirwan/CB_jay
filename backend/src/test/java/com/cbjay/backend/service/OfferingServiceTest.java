package com.cbjay.backend.service;

import com.cbjay.backend.dto.CreateOfferingRequest;
import com.cbjay.backend.dto.OfferingDto;
import com.cbjay.backend.exception.ApiException;
import com.cbjay.backend.model.Offering;
import com.cbjay.backend.model.OfferingStatus;
import com.cbjay.backend.repository.OfferingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferingServiceTest {

    @Mock
    private OfferingRepository offeringRepository;

    @InjectMocks
    private OfferingService offeringService;

    @Test
    void getAllOfferingsSortsByCreatedAtDescending() {
        Offering older = offering("Older", OfferingStatus.ACTIVE,
                Instant.parse("2025-01-01T10:00:00Z"),
                Instant.parse("2025-01-01T10:00:00Z"), null);
        Offering newer = offering("Newer", OfferingStatus.CLOSED,
                Instant.parse("2025-01-02T10:00:00Z"),
                Instant.parse("2025-01-02T10:00:00Z"),
                Instant.parse("2025-01-03T10:00:00Z"));

        when(offeringRepository.findAll()).thenReturn(List.of(older, newer));

        List<OfferingDto> result = offeringService.getAllOfferings();

        assertEquals(2, result.size());
        assertEquals("Newer", result.get(0).name());
        assertEquals("Older", result.get(1).name());
        assertEquals("closed", result.get(0).status());
    }

    @Test
    void getActiveOfferingsFiltersClosedAndSortsByStartDateDescending() {
        Offering activeOld = offering("Active Old", OfferingStatus.ACTIVE,
                Instant.parse("2025-01-01T10:00:00Z"),
                Instant.parse("2025-01-01T10:00:00Z"), null);
        Offering closed = offering("Closed", OfferingStatus.CLOSED,
                Instant.parse("2025-01-03T10:00:00Z"),
                Instant.parse("2025-01-03T10:00:00Z"),
                Instant.parse("2025-01-04T10:00:00Z"));
        Offering activeNew = offering("Active New", OfferingStatus.ACTIVE,
                Instant.parse("2025-01-02T10:00:00Z"),
                Instant.parse("2025-01-04T10:00:00Z"), null);

        when(offeringRepository.findAll()).thenReturn(List.of(activeOld, closed, activeNew));

        List<OfferingDto> result = offeringService.getActiveOfferings();

        assertEquals(2, result.size());
        assertEquals("Active New", result.get(0).name());
        assertEquals("Active Old", result.get(1).name());
    }

    @Test
    void createOfferingTrimsNameAndSetsDefaultStatus() {
        when(offeringRepository.save(any(Offering.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Instant before = Instant.now();
        OfferingDto result = offeringService.createOffering(new CreateOfferingRequest("  Team Sync  "));
        Instant after = Instant.now();

        ArgumentCaptor<Offering> captor = ArgumentCaptor.forClass(Offering.class);
        verify(offeringRepository).save(captor.capture());
        Offering saved = captor.getValue();

        assertNotNull(saved.getId());
        assertEquals("Team Sync", saved.getName());
        assertEquals(OfferingStatus.ACTIVE, saved.getStatus());
        assertNull(saved.getClosedDate());
        assertNotNull(saved.getCreatedAt());
        assertNotNull(saved.getStartDate());
        assertEquals(saved.getCreatedAt(), saved.getStartDate());
        assertEquals(false, saved.getCreatedAt().isBefore(before));
        assertEquals(false, saved.getCreatedAt().isAfter(after));
        assertEquals("active", result.status());
    }

    @Test
    void updateStatusThrowsWhenOfferingMissing() {
        UUID id = UUID.randomUUID();
        when(offeringRepository.findById(id)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> offeringService.updateStatus(id, "active"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("Offering not found.", ex.getMessage());
    }

    @Test
    void updateStatusThrowsForInvalidStatus() {
        UUID id = UUID.randomUUID();
        Offering offering = offering("Name", OfferingStatus.ACTIVE, Instant.now(), Instant.now(), null);
        when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));

        ApiException ex = assertThrows(ApiException.class, () -> offeringService.updateStatus(id, "not-real"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Invalid offering status.", ex.getMessage());
    }

    @Test
    void updateStatusClosedSetsClosedDate() {
        UUID id = UUID.randomUUID();
        Offering offering = offering("Name", OfferingStatus.ACTIVE,
                Instant.parse("2025-01-01T10:00:00Z"),
                Instant.parse("2025-01-01T10:00:00Z"), null);
        when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));
        when(offeringRepository.save(any(Offering.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OfferingDto result = offeringService.updateStatus(id, "closed");

        assertEquals("closed", result.status());
        assertEquals(OfferingStatus.CLOSED, offering.getStatus());
        assertNotNull(offering.getClosedDate());
    }

    @Test
    void updateStatusActiveSetsNewStartDate() {
        UUID id = UUID.randomUUID();
        Offering offering = offering("Name", OfferingStatus.CLOSED,
                Instant.parse("2025-01-01T10:00:00Z"),
                Instant.parse("2025-01-01T10:00:00Z"),
                Instant.parse("2025-01-02T10:00:00Z"));
        when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));
        when(offeringRepository.save(any(Offering.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OfferingDto result = offeringService.updateStatus(id, "ACTIVE");

        assertEquals("active", result.status());
        assertEquals(OfferingStatus.ACTIVE, offering.getStatus());
        assertNotNull(offering.getStartDate());
    }

    @Test
    void getRequiredActiveOfferingThrowsWhenClosed() {
        UUID id = UUID.randomUUID();
        Offering offering = offering("Closed", OfferingStatus.CLOSED, Instant.now(), Instant.now(), Instant.now());
        when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));

        ApiException ex = assertThrows(ApiException.class, () -> offeringService.getRequiredActiveOffering(id));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("This offering is closed and cannot accept ratings.", ex.getMessage());
    }

    @Test
    void getRequiredActiveOfferingReturnsOfferingWhenActive() {
        UUID id = UUID.randomUUID();
        Offering offering = offering("Active", OfferingStatus.ACTIVE, Instant.now(), Instant.now(), null);
        when(offeringRepository.findById(id)).thenReturn(Optional.of(offering));

        Offering result = offeringService.getRequiredActiveOffering(id);

        assertEquals(offering, result);
    }

    private static Offering offering(String name, OfferingStatus status, Instant createdAt, Instant startDate, Instant closedDate) {
        Offering offering = new Offering();
        offering.setId(UUID.randomUUID());
        offering.setName(name);
        offering.setStatus(status);
        offering.setCreatedAt(createdAt);
        offering.setStartDate(startDate);
        offering.setClosedDate(closedDate);
        return offering;
    }
}

