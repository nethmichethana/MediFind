package com.ijse.MediFind.controller;


import com.ijse.MediFind.entity.Reservation;
import com.ijse.MediFind.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;


}
