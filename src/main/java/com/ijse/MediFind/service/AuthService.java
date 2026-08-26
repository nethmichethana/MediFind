package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.LoginReqDTO;
import com.ijse.MediFind.dto.response.LoginResDTO;

public interface AuthService {

    LoginResDTO login(LoginReqDTO loginReqDTO);
}
