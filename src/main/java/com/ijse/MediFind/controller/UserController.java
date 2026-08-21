package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.UserReqDTO;
import com.ijse.MediFind.dto.response.UserResDTO;
import com.ijse.MediFind.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/users")
    public CommonResponse createUser(@RequestBody UserReqDTO userReqDTO) {

        UserResDTO user = userService.createUser(userReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                user,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/users/{id}")
    public CommonResponse getUserById(@PathVariable Long id) {

        UserResDTO user = userService.getUserById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                user,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/users")
    public CommonResponse getAllUsers() {

        List<UserResDTO> userList = userService.getAllUsers();

        return new CommonResponse(
                OPERATION_SUCCESS,
                userList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/users/{id}")
    public CommonResponse updateUser(
            @PathVariable Long id,
            @RequestBody UserReqDTO userReqDTO) {

        UserResDTO user = userService.updateUser(id, userReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                user,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/users/{id}")
    public CommonResponse deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }
}