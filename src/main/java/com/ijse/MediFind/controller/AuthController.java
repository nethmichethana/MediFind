package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.LoginReqDTO;
import com.ijse.MediFind.dto.response.LoginResDTO;
import com.ijse.MediFind.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public CommonResponse login(@RequestBody LoginReqDTO loginReqDTO) {

        LoginResDTO loginResponse = authService.login(loginReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                loginResponse,
                SUCCESS_MESSAGE
        );
    }

}
