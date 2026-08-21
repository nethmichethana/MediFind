package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.RoleReqDTO;
import com.ijse.MediFind.dto.response.RoleResDTO;
import com.ijse.MediFind.entity.Role;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.RoleRepository;
import com.ijse.MediFind.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public RoleResDTO createRole(RoleReqDTO roleReqDTO) {

        log.info("Creating new role : {}", roleReqDTO.getRoleName());

        Role role = Role.builder()
                .roleName(roleReqDTO.getRoleName())
                .build();

        Role savedRole = roleRepository.save(role);

        return RoleResDTO.builder()
                .id(savedRole.getId())
                .roleName(savedRole.getRoleName())
                .build();
    }

    @Override
    public RoleResDTO getRoleById(Long id) {

        log.info("Fetching role with id: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found with id: " + id)
                );

        return RoleResDTO.builder()
                .id(role.getId())
                .roleName(role.getRoleName())
                .build();
    }

    @Override
    public List<RoleResDTO> getAllRoles() {
        log.info("Fetching all roles");

        return roleRepository.findAll()
                .stream()
                .map(role -> RoleResDTO.builder()
                        .id(role.getId())
                        .roleName(role.getRoleName())
                        .build())
                .toList();
    }

    @Override
    public RoleResDTO updateRole(Long id, RoleResDTO roleResDTO) {

        log.info("Updating role with id: {}", id);

        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found with id: " + id)
                );

        existingRole.setRoleName(roleResDTO.getRoleName());

        Role updatedRole = roleRepository.save(existingRole);

        return RoleResDTO.builder()
                .id(updatedRole.getId())
                .roleName(updatedRole.getRoleName())
                .build();
    }

    @Override
    public void deleteRole(Long id) {

        log.info("Deleting role with id: {}", id);

        Role role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found with id: " + id)
                );

        roleRepository.delete(role);

        log.info("Role deleted successfully with id: {}", id);

    }
}
