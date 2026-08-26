package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.UserReqDTO;
import com.ijse.MediFind.dto.response.UserResDTO;
import com.ijse.MediFind.entity.Role;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.exception.BadRequestException;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.RoleRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResDTO createUser(UserReqDTO userReqDTO) {

        if (userRepository.existsByEmail(userReqDTO.getEmail())) {
            throw new BadRequestException(
                    "User already exists with email: " + userReqDTO.getEmail()
            );
        }

        Role role = roleRepository.findById(userReqDTO.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found with id: " + userReqDTO.getRoleId()
                        )
                );

        User user = User.builder()
                .name(userReqDTO.getName())
                .email(userReqDTO.getEmail())
                .password(passwordEncoder.encode(userReqDTO.getPassword()))
                .phone(userReqDTO.getPhone())
                .status(userReqDTO.getStatus())
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        return UserResDTO.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .status(savedUser.getStatus())
                .roleId(savedUser.getRole().getId())
                .build();
    }

    @Override
    public UserResDTO getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );

        return UserResDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roleId(user.getRole().getId())
                .build();
    }

    @Override
    public List<UserResDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> UserResDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .status(user.getStatus())
                        .roleId(user.getRole().getId())
                        .build()
                )
                .toList();
    }

    @Override
    public UserResDTO updateUser(Long id, UserReqDTO userReqDTO) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );

        if (!user.getEmail().equals(userReqDTO.getEmail())
                && userRepository.existsByEmail(userReqDTO.getEmail())) {

            throw new BadRequestException(
                    "User already exists with email: " + userReqDTO.getEmail()
            );
        }

        Role role = roleRepository.findById(userReqDTO.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found with id: " + userReqDTO.getRoleId()
                        )
                );

        user.setName(userReqDTO.getName());
        user.setEmail(userReqDTO.getEmail());
        user.setPassword(userReqDTO.getPassword());
        user.setPhone(userReqDTO.getPhone());
        user.setStatus(userReqDTO.getStatus());
        user.setRole(role);

        User updatedUser = userRepository.save(user);

        return UserResDTO.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .status(updatedUser.getStatus())
                .roleId(updatedUser.getRole().getId())
                .build();
    }

    @Override
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );

        userRepository.delete(user);
    }
}