package com.ijse.MediFind.controller;


import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.ReservationReqDTO;
import com.ijse.MediFind.dto.response.ReservationResDTO;
import com.ijse.MediFind.entity.Reservation;
import com.ijse.MediFind.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/reservations/{id}")
    public CommonResponse getReservationById(@PathVariable Long id) {

        ReservationResDTO reservation = reservationService.getReservationById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                reservation,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/reservations")
    public CommonResponse getAllReservations() {

        List<ReservationResDTO> reservationList = reservationService.getAllReservations();

        return new CommonResponse(
                OPERATION_SUCCESS,
                reservationList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/reservations/{id}")
    public CommonResponse updateReservation(@PathVariable Long id, @RequestBody ReservationReqDTO reservationReqDTO) {

        ReservationResDTO reservation = reservationService.updateReservation(id, reservationReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                reservation,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/reservations/{id}")
    public CommonResponse deleteReservation(@PathVariable Long id) {reservationService.deleteReservation(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

}
