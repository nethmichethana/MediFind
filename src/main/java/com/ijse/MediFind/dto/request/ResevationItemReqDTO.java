package com.ijse.MediFind.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResevationItemReqDTO {

    private Integer quantity;

    private Double unitPrice;

    private Long reservationId;

    private Long medicineId;
}
