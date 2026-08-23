package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.ReservationItemReqDTO;
import com.ijse.MediFind.dto.response.ReservationItemResDTO;
import com.ijse.MediFind.repository.MedicineRepository;
import com.ijse.MediFind.repository.ReservationRepository;
import com.ijse.MediFind.repository.ResevationItemRepository;
import com.ijse.MediFind.service.ReservationItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationItemServiceImpl implements ReservationItemService {

    private final ResevationItemRepository resevationItemRepository;
    private final ReservationRepository reservationRepository;
    private final MedicineRepository medicineRepository;


    @Override
    public ReservationItemResDTO createReservationItem(ReservationItemReqDTO reservationItemReqDTO) {
        return null;
    }

    @Override
    public ReservationItemResDTO getReservationItemById(Long id) {
        return null;
    }

    @Override
    public List<ReservationItemResDTO> getAllReservationItems() {
        return List.of();
    }

    @Override
    public ReservationItemResDTO updateReservationItem(Long id, ReservationItemReqDTO reservationItemReqDTO) {
        return null;
    }

    @Override
    public void deleteReservationItem(Long id) {

    }
}
