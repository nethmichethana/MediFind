package com.ijse.MediFind.security;

import com.ijse.MediFind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<com.ijse.MediFind.entity.User> optionalUser = userRepository.findByEmail(username);

        if (optionalUser.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        com.ijse.MediFind.entity.User user = optionalUser.get();
        String roleName = user.getRole().getRoleName().name();

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(roleName)
                .build();
    }
}
