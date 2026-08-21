package com.ijse.MediFind.dto.response;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PharmacyBranchResDTO {

    private Long id;

    private String name;

    private String address;

    private String city;

    private String phone;

    private String email;

    private Double latitude;

    private Double longitude;

    private Boolean active;

    private Long pharmacyId;
}
