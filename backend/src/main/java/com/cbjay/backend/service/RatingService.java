package com.cbjay.backend.service;

import com.cbjay.backend.dto.CreateRatingRequest;
import com.cbjay.backend.dto.RatingDto;
import com.cbjay.backend.exception.ApiException;
import com.cbjay.backend.model.Offering;
import com.cbjay.backend.model.Rating;
import com.cbjay.backend.repository.RatingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final OfferingService offeringService;

    public RatingService(RatingRepository ratingRepository, OfferingService offeringService) {
        this.ratingRepository = ratingRepository;
        this.offeringService = offeringService;
    }

    public List<RatingDto> getAllRatings() {
        return ratingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public RatingDto createRating(CreateRatingRequest request) {
        UUID offeringId;
        try {
            offeringId = UUID.fromString(request.offeringId());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid offering id.");
        }

        Offering offering = offeringService.getRequiredActiveOffering(offeringId);

        Rating rating = new Rating();
        rating.setId(UUID.randomUUID());
        rating.setOffering(offering);
        rating.setScore(request.score());
        String username = request.username() == null ? null : request.username().trim();
        rating.setUsername(username == null || username.isBlank() ? null : username);
        String feedback = request.feedback() == null ? null : request.feedback().trim();
        rating.setFeedback(feedback == null || feedback.isBlank() ? null : feedback);
        rating.setCreatedAt(java.time.Instant.now());

        return toDto(ratingRepository.save(rating));
    }

    private RatingDto toDto(Rating rating) {
        return new RatingDto(
                rating.getId().toString(),
                rating.getOffering().getId().toString(),
                rating.getScore(),
                rating.getUsername(),
                rating.getFeedback(),
                rating.getCreatedAt()
        );
    }
}



