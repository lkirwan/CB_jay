package com.cbjay.backend.controller;

import com.cbjay.backend.dto.CreateRatingRequest;
import com.cbjay.backend.dto.RatingDto;
import com.cbjay.backend.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/api/ratings")
    public List<RatingDto> getRatings() {
        return ratingService.getAllRatings();
    }

    @PostMapping("/api/public/ratings")
    public RatingDto createRating(@Valid @RequestBody CreateRatingRequest request) {
        return ratingService.createRating(request);
    }
}

