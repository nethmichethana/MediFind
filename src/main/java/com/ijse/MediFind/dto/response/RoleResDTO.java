package com.ijse.MediFind.dto.response;

import com.ijse.MediFind.enumeration.RoleName;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleResDTO {

    private Long id;
    private RoleName roleName;
}
