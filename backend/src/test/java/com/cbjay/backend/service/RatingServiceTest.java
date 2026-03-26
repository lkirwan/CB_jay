package com.cbjay.backend.service;

import com.cbjay.backend.dto.CreateRatingRequest;
import com.cbjay.backend.dto.RatingDto;
import com.cbjay.backend.exception.ApiException;
import com.cbjay.backend.model.Offering;
import com.cbjay.backend.model.OfferingStatus;
import com.cbjay.backend.model.Rating;
import com.cbjay.backend.repository.RatingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private OfferingService offeringService;

    @InjectMocks
    private RatingService ratingService;

    @Test
    void getAllRatingsMapsEntitiesToDtos() {
        Offering offering = new Offering();
        offering.setId(UUID.randomUUID());

        Rating rating = new Rating();
        rating.setId(UUID.randomUUID());
        rating.setOffering(offering);
        rating.setScore(5);
        rating.setUsername("alice");
        rating.setFeedback("Great session!");
        rating.setCreatedAt(Instant.parse("2025-02-01T12:00:00Z"));

        when(ratingRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(rating));

        List<RatingDto> result = ratingService.getAllRatings();

        assertEquals(1, result.size());
        assertEquals(rating.getId().toString(), result.get(0).id());
        assertEquals(offering.getId().toString(), result.get(0).offeringId());
        assertEquals("alice", result.get(0).username());
        assertEquals("Great session!", result.get(0).feedback());
    }

    @Test
    void createRatingRejectsInvalidOfferingId() {
        CreateRatingRequest request = new CreateRatingRequest("invalid-uuid", 4, "user", null);

        ApiException ex = assertThrows(ApiException.class, () -> ratingService.createRating(request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Invalid offering id.", ex.getMessage());
        verifyNoInteractions(offeringService);
        verifyNoInteractions(ratingRepository);
    }

    @Test
    void createRatingTrimsUsernameAndSavesRating() {
        UUID offeringId = UUID.randomUUID();
        Offering offering = new Offering();
        offering.setId(offeringId);
        offering.setStatus(OfferingStatus.ACTIVE);

        when(offeringService.getRequiredActiveOffering(offeringId)).thenReturn(offering);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRatingRequest request = new CreateRatingRequest(offeringId.toString(), 3, "  bob  ", "Good.");
        RatingDto result = ratingService.createRating(request);

        ArgumentCaptor<Rating> captor = ArgumentCaptor.forClass(Rating.class);
        verify(ratingRepository).save(captor.capture());
        Rating saved = captor.getValue();

        assertEquals("bob", saved.getUsername());
        assertEquals(3, saved.getScore());
        assertEquals(offering, saved.getOffering());
        assertEquals("bob", result.username());
        assertEquals("Good.", result.feedback());
    }

    @Test
    void createRatingStoresNullWhenUsernameBlank() {
        UUID offeringId = UUID.randomUUID();
        Offering offering = new Offering();
        offering.setId(offeringId);
        offering.setStatus(OfferingStatus.ACTIVE);

        when(offeringService.getRequiredActiveOffering(offeringId)).thenReturn(offering);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRatingRequest request = new CreateRatingRequest(offeringId.toString(), 5, "   ", null);
        RatingDto result = ratingService.createRating(request);

        ArgumentCaptor<Rating> captor = ArgumentCaptor.forClass(Rating.class);
        verify(ratingRepository).save(captor.capture());

        assertNull(captor.getValue().getUsername());
        assertNull(result.username());
        assertNull(result.feedback());
    }

    @Test
    void createRatingTrimsFeedbackAndStoresNullWhenBlank() {
        UUID offeringId = UUID.randomUUID();
        Offering offering = new Offering();
        offering.setId(offeringId);
        offering.setStatus(OfferingStatus.ACTIVE);

        when(offeringService.getRequiredActiveOffering(offeringId)).thenReturn(offering);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRatingRequest request = new CreateRatingRequest(offeringId.toString(), 4, "charlie", "  ");
        ratingService.createRating(request);

        ArgumentCaptor<Rating> captor = ArgumentCaptor.forClass(Rating.class);
        verify(ratingRepository).save(captor.capture());

        assertNull(captor.getValue().getFeedback());
    }

    @Test
    void createRatingPersistsTrimmedFeedback() {
        UUID offeringId = UUID.randomUUID();
        Offering offering = new Offering();
        offering.setId(offeringId);
        offering.setStatus(OfferingStatus.ACTIVE);

        when(offeringService.getRequiredActiveOffering(offeringId)).thenReturn(offering);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateRatingRequest request = new CreateRatingRequest(offeringId.toString(), 5, "dave", "  Very helpful!  ");
        RatingDto result = ratingService.createRating(request);

        ArgumentCaptor<Rating> captor = ArgumentCaptor.forClass(Rating.class);
        verify(ratingRepository).save(captor.capture());

        assertEquals("Very helpful!", captor.getValue().getFeedback());
        assertEquals("Very helpful!", result.feedback());
    }


}
