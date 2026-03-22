package com.cbjay.backend.repository;

import com.cbjay.backend.model.FacilitatorAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacilitatorAccountRepository extends JpaRepository<FacilitatorAccount, Long> {
    Optional<FacilitatorAccount> findByUsername(String username);
}

