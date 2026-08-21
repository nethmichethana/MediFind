package com.ijse.MediFind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PharmacyBranchReqDTO {

    @NotBlank(message = "Branch name is required")
    private String name;

    private String address;

    private String city;

    private String phone;

    private String email;

    private Double latitude;

    private Double longitude;

    private Boolean active;

    @NotNull(message = "Pharmacy is required")
    private Long pharmacyId;
}
