package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.ReservationReqDTO;
import com.ijse.MediFind.dto.response.ReservationResDTO;

import java.util.List;


public interface ReservationService {

    ReservationResDTO createReservation(ReservationReqDTO reservationReqDTO);

    ReservationResDTO getReservationById(Long id);

    List<ReservationResDTO> getAllReservations();

    ReservationResDTO updateReservation(Long id, ReservationReqDTO reservationReqDTO);

    void deleteReservation(Long id);
}
