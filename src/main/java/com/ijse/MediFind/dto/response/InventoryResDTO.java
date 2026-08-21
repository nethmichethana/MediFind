package com.ijse.MediFind.dto.response;

import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryResDTO {

    private Long id;

    private Long pharmacyBranchId;

    private Long medicineBatchId;

    private Integer quantity;

    private Integer reorderLevel;

    private LocalDateTime lastUpdated;
}
