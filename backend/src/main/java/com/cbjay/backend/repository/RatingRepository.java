package com.cbjay.backend.repository;

import com.cbjay.backend.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {
    List<Rating> findAllByOrderByCreatedAtDesc();
}

