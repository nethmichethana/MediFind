package com.ijse.MediFind.controller;


import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.ReservationReqDTO;
import com.ijse.MediFind.dto.response.ReservationResDTO;
import com.ijse.MediFind.entity.Reservation;
import com.ijse.MediFind.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/reservations")
    public CommonResponse createReservation(
            @RequestBody ReservationReqDTO reservationReqDTO) {

        ReservationResDTO reservation =
                reservationService.createReservation(
                        reservationReqDTO
                );

        return new CommonResponse(
                OPERATION_SUCCESS,
                reservation,
                SUCCESS_MESSAGE
        );
    }


}
