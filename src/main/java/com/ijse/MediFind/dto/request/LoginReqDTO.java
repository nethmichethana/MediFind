package com.ijse.MediFind.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginReqDTO {

    private String email;

    private String password;
}
