package com.ijse.MediFind.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineCategoryReqDTO {

    @NotBlank(message = "Category name is required")
    private String name;
}
