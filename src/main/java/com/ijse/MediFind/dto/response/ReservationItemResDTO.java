package com.ijse.MediFind.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationItemResDTO {

    private Long id;

    private Integer quantity;

    private Double unitPrice;

    private Long reservationId;

    private Long medicineId;
}
