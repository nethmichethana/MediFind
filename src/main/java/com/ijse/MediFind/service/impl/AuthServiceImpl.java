package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.LoginReqDTO;
import com.ijse.MediFind.dto.response.LoginResDTO;
import com.ijse.MediFind.dto.response.UserResDTO;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.security.JwtUtil;
import com.ijse.MediFind.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResDTO login(LoginReqDTO loginReqDTO) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginReqDTO.getEmail(),
                        loginReqDTO.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(loginReqDTO.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: "
                                        + loginReqDTO.getEmail()
                        )
                );

        UserResDTO userResDTO = UserResDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roleId(user.getRole().getId())
                .build();

        String token = jwtUtil.generateToken(userResDTO);

        return LoginResDTO.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getRoleName().name())
                .build();
    }
}
