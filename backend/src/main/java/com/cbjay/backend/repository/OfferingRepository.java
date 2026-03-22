package com.cbjay.backend.repository;

import com.cbjay.backend.model.Offering;
import com.cbjay.backend.model.OfferingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferingRepository extends JpaRepository<Offering, UUID> {
    List<Offering> findAllByStatusOrderByStartDateDesc(OfferingStatus status);
}

