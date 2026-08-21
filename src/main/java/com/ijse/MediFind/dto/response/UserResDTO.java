package com.ijse.MediFind.dto.response;

import com.ijse.MediFind.enumeration.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserStatus status;
    private Long roleId;
}