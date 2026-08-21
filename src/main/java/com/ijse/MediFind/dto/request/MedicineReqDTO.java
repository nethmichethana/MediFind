package com.ijse.MediFind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineReqDTO {

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String genericName;

    private String brandName;

    private String dosageForm;

    private String strength;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Prescription required status is required")
    private Boolean prescriptionRequired;

    @NotNull(message = "Active status is required")
    private Boolean active;
}
