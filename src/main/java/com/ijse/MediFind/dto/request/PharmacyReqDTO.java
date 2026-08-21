package com.ijse.MediFind.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PharmacyReqDTO {

    @NotBlank(message = "Pharmacy name is required")
    private String name;

    private String registrationNumber;

    private String phone;

    private String email;

    private String address;

    private String city;

    private Long ownerId;
}
