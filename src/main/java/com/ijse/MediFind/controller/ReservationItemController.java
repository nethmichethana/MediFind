package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.ReservationItemReqDTO;
import com.ijse.MediFind.dto.response.ReservationItemResDTO;
import com.ijse.MediFind.service.ReservationItemService;
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


}
