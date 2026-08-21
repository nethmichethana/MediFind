package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.UserReqDTO;
import com.ijse.MediFind.dto.response.UserResDTO;

import java.util.List;

public interface UserService {

    UserResDTO createUser(UserReqDTO userReqDTO);

    UserResDTO getUserById(Long id);

    List<UserResDTO> getAllUsers();

    UserResDTO updateUser(Long id, UserReqDTO userReqDTO);

    void deleteUser(Long id);
}
