package com.ijse.MediFind.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PharmacyResDTO {

    private Long id;

    private String name;

    private String registrationNumber;

    private String phone;

    private String email;

    private String address;

    private String city;

    private Long ownerId;
}
