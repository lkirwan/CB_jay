package com.cbjay.backend.service;

import com.cbjay.backend.model.FacilitatorAccount;
import com.cbjay.backend.repository.FacilitatorAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacilitatorAccountServiceTest {

    @Mock
    private FacilitatorAccountRepository facilitatorAccountRepository;

    @InjectMocks
    private FacilitatorAccountService facilitatorAccountService;

    @Test
    void getRequiredAccountReturnsExistingUser() {
        FacilitatorAccount account = new FacilitatorAccount();
        account.setUsername("facilitator");
        when(facilitatorAccountRepository.findByUsername("facilitator")).thenReturn(Optional.of(account));

        FacilitatorAccount result = facilitatorAccountService.getRequiredAccount("facilitator");

        assertEquals(account, result);
    }

    @Test
    void getRequiredAccountThrowsWhenMissing() {
        when(facilitatorAccountRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> facilitatorAccountService.getRequiredAccount("missing"));
    }

    @Test
    void loadUserByUsernameAddsRolePrefix() {
        FacilitatorAccount account = new FacilitatorAccount();
        account.setUsername("facilitator");
        account.setPasswordHash("hash");
        account.setRole("FACILITATOR");
        when(facilitatorAccountRepository.findByUsername("facilitator")).thenReturn(Optional.of(account));

        UserDetails userDetails = facilitatorAccountService.loadUserByUsername("facilitator");

        assertEquals("facilitator", userDetails.getUsername());
        assertEquals("hash", userDetails.getPassword());
        assertEquals("ROLE_FACILITATOR", userDetails.getAuthorities().iterator().next().getAuthority());
    }
}

