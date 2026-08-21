package com.ijse.MediFind.dto.request;

import com.ijse.MediFind.enumeration.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleReqDTO {

    @NotNull(message = "RoleName is required")
    private RoleName roleName;
}
