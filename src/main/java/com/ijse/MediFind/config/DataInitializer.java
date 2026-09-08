package com.ijse.MediFind.config;

import com.ijse.MediFind.entity.Role;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.enumeration.RoleName;
import com.ijse.MediFind.enumeration.UserStatus;
import com.ijse.MediFind.repository.RoleRepository;
import com.ijse.MediFind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Initialize default roles if not present
        Role adminRole = getOrCreateRole(RoleName.ADMIN);
        Role pharmacyAdminRole = getOrCreateRole(RoleName.PHARMACY_ADMIN);
        Role staffRole = getOrCreateRole(RoleName.PHARMACY_STAFF);
        Role customerRole = getOrCreateRole(RoleName.CUSTOMER);

        // Seed demo customer if not present
        if (!userRepository.existsByEmail("customer@medifind.com")) {
            User demoCustomer = User.builder()
                    .name("Demo Customer")
                    .email("customer@medifind.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0771234567")
                    .status(UserStatus.ACTIVE)
                    .role(customerRole)
                    .build();
            userRepository.save(demoCustomer);
            log.info("Initialized default customer user: customer@medifind.com / password123");
        }

        // Seed demo admin if not present
        if (!userRepository.existsByEmail("admin@medifind.com")) {
            User demoAdmin = User.builder()
                    .name("System Admin")
                    .email("admin@medifind.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("0112233445")
                    .status(UserStatus.ACTIVE)
                    .role(adminRole)
                    .build();
            userRepository.save(demoAdmin);
            log.info("Initialized default admin user: admin@medifind.com / password123");
        }
    }

    private Role getOrCreateRole(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> {
                    Role newRole = Role.builder()
                            .roleName(roleName)
                            .build();
                    Role saved = roleRepository.save(newRole);
                    log.info("Initialized role: {}", roleName);
                    return saved;
                });
    }
}
