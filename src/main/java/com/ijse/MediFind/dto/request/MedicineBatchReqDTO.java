package com.ijse.MediFind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineBatchReqDTO {

    @NotBlank(message = "Batch number is required")
    private String batchNumber;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private LocalDate manufactureDate;

    @NotNull(message = "Unit price is required")
    private Double unitPrice;

    @NotNull(message = "Medicine is required")
    private Long medicineId;
}
