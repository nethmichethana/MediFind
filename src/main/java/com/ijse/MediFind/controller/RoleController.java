package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.RoleReqDTO;
import com.ijse.MediFind.dto.response.RoleResDTO;
import com.ijse.MediFind.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;


@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping("/roles")
    public CommonResponse createRole(@RequestBody RoleReqDTO roleReqDTO){

        roleService.createRole(roleReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/roles/{id}")
    public CommonResponse getRoleById(@PathVariable Long id) {

        RoleResDTO role = roleService.getRoleById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                role,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/roles")
    public CommonResponse getAllRoles() {

        List<RoleResDTO> roleList = roleService.getAllRoles();

        return new CommonResponse(
                OPERATION_SUCCESS,
                roleList,
                SUCCESS_MESSAGE
        );

    }

    @PutMapping("/roles/{id}")
    public CommonResponse updateRole(
            @PathVariable Long id,
            @RequestBody RoleResDTO roleResDTO) {

        roleService.updateRole(id, roleResDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/roles/{id}")
    public CommonResponse deleteRole(@PathVariable Long id) {

        roleService.deleteRole(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

}
