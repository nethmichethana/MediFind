package com.ijse.MediFind.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryReqDTO {

    @NotNull(message = "Pharmacy branch is required")
    private Long pharmacyBranchId;

    @NotNull(message = "Medicine batch is required")
    private Long medicineBatchId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    @NotNull(message = "Reorder level is required")
    private Integer reorderLevel;

}
