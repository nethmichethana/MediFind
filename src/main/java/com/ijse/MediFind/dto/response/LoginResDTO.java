package com.ijse.MediFind.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResDTO {

    private String token;

    private Long userId;

    private String name;

    private String email;

    private String role;
}
