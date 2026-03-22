package com.cbjay.backend.config;

import com.cbjay.backend.model.FacilitatorAccount;
import com.cbjay.backend.repository.FacilitatorAccountRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DataInitializerTest {

    @Test
    void seedFacilitatorCreatesAccountWhenMissing() throws Exception {
        DataInitializer initializer = new DataInitializer();
        FacilitatorAccountRepository repository = mock(FacilitatorAccountRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);

        when(repository.findByUsername("facilitator")).thenReturn(Optional.empty());
        when(encoder.encode("pw")).thenReturn("hashed-pw");

        CommandLineRunner runner = initializer.seedFacilitator(repository, encoder, "facilitator", "pw");
        runner.run();

        ArgumentCaptor<FacilitatorAccount> captor = ArgumentCaptor.forClass(FacilitatorAccount.class);
        verify(repository).save(captor.capture());

        FacilitatorAccount saved = captor.getValue();
        assertEquals("facilitator", saved.getUsername());
        assertEquals("hashed-pw", saved.getPasswordHash());
        assertEquals("FACILITATOR", saved.getRole());
    }

    @Test
    void seedFacilitatorUpdatesExistingAccount() throws Exception {
        DataInitializer initializer = new DataInitializer();
        FacilitatorAccountRepository repository = mock(FacilitatorAccountRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);

        FacilitatorAccount existing = new FacilitatorAccount();
        existing.setUsername("facilitator");
        existing.setPasswordHash("old");
        existing.setRole("FACILITATOR");

        when(repository.findByUsername("facilitator")).thenReturn(Optional.of(existing));
        when(encoder.encode("new-pw")).thenReturn("new-hash");

        CommandLineRunner runner = initializer.seedFacilitator(repository, encoder, "facilitator", "new-pw");
        runner.run();

        verify(repository).save(existing);
        assertEquals("new-hash", existing.getPasswordHash());
    }
}

