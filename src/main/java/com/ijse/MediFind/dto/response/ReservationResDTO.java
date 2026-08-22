package com.ijse.MediFind.dto.response;


import com.ijse.MediFind.enumeration.ReservationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationResDTO {

    private Long id;

    private LocalDateTime reservationDate;

    private LocalDateTime pickupDate;

    private ReservationStatus status;

    private String notes;

    private Long userId;

    private Long pharmacyBranchId;
}
