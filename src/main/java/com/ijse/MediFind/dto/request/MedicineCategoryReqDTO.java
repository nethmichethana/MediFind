package com.ijse.MediFind.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicineCategoryReqDTO {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;
}
