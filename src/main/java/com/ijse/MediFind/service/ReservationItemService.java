package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.ReservationItemReqDTO;
import com.ijse.MediFind.dto.response.ReservationItemResDTO;

import java.util.List;

public interface ReservationItemService {

    ReservationItemResDTO createReservationItem(ReservationItemReqDTO reservationItemReqDTO);

    ReservationItemResDTO getReservationItemById(Long id);

    List<ReservationItemResDTO> getAllReservationItems();

    ReservationItemResDTO updateReservationItem(Long id, ReservationItemReqDTO reservationItemReqDTO);

    void deleteReservationItem(Long id);
}
