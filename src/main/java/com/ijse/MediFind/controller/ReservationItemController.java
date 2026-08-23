package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.ReservationItemReqDTO;
import com.ijse.MediFind.dto.response.ReservationItemResDTO;
import com.ijse.MediFind.service.ReservationItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReservationItemController {

    private final ReservationItemService reservationItemService;

    @PostMapping("/reservation-items")
    public CommonResponse createReservationItem(@RequestBody ReservationItemReqDTO reservationItemReqDTO) {

        ReservationItemResDTO reservationItem = reservationItemService.createReservationItem(reservationItemReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                reservationItem,
                SUCCESS_MESSAGE
        );
    }


    @GetMapping("/reservation-items/{id}")
    public CommonResponse getReservationItemById(@PathVariable Long id) {

        ReservationItemResDTO reservationItem = reservationItemService.getReservationItemById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                reservationItem,
                SUCCESS_MESSAGE
        );
    }

}
