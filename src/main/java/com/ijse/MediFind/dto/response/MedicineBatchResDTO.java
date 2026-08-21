package com.ijse.MediFind.dto.response;

import lombok.*;

import java.time.LocalDate;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicineBatchResDTO {

    private Long id;

    private String batchNumber;

    private Integer quantity;

    private LocalDate expiryDate;

    private LocalDate manufactureDate;

    private Double unitPrice;

    private Long medicineId;
}
