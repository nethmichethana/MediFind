package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.RoleReqDTO;
import com.ijse.MediFind.dto.response.RoleResDTO;

import java.util.List;

public interface RoleService {

    RoleResDTO createRole(RoleReqDTO roleReqDTO);

    RoleResDTO getRoleById(Long id);

    List<RoleResDTO> getAllRoles();

    RoleResDTO updateRole(Long id, RoleResDTO roleResDTO);

    void deleteRole(Long id);
}
