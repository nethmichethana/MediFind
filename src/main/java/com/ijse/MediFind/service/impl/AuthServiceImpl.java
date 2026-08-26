package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.LoginReqDTO;
import com.ijse.MediFind.dto.response.LoginResDTO;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.security.JwtUtil;
import com.ijse.MediFind.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
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
        return null;
    }
}
