package com.cbjay.backend.service;

import com.cbjay.backend.model.FacilitatorAccount;
import com.cbjay.backend.repository.FacilitatorAccountRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class FacilitatorAccountService implements UserDetailsService {

    private final FacilitatorAccountRepository facilitatorAccountRepository;

    public FacilitatorAccountService(FacilitatorAccountRepository facilitatorAccountRepository) {
        this.facilitatorAccountRepository = facilitatorAccountRepository;
    }

    public FacilitatorAccount getRequiredAccount(String username) {
        return facilitatorAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Facilitator account not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        FacilitatorAccount account = getRequiredAccount(username);
        return new User(
                account.getUsername(),
                account.getPasswordHash(),
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole()))
        );
    }
}

