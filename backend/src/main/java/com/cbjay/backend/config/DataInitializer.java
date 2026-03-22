package com.cbjay.backend.config;

import com.cbjay.backend.model.FacilitatorAccount;
import com.cbjay.backend.repository.FacilitatorAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedFacilitator(
            FacilitatorAccountRepository facilitatorAccountRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.facilitator.username}") String username,
            @Value("${app.facilitator.password}") String password
    ) {
        return args -> {
            FacilitatorAccount account = facilitatorAccountRepository.findByUsername(username)
                    .orElseGet(FacilitatorAccount::new);
            account.setUsername(username);
            account.setPasswordHash(passwordEncoder.encode(password));
            account.setRole("FACILITATOR");
            facilitatorAccountRepository.save(account);
        };
    }
}

