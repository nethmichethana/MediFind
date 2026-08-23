package com.ijse.MediFind.controller;

import com.ijse.MediFind.service.ReservationItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReservationItemController {

    private final ReservationItemService reservationItemService;

}
