package com.ijse.MediFind.dto.response;

import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineResDTO {

    private Long id;

    private String name;

    private String genericName;

    private String brandName;

    private String dosageForm;

    private String strength;

    private String description;

    private Long categoryId;

    private Boolean prescriptionRequired;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
