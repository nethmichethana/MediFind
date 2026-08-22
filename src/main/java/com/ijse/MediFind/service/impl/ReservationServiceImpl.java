package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.ReservationReqDTO;
import com.ijse.MediFind.dto.response.ReservationResDTO;
import com.ijse.MediFind.repository.PharmacyBranchRepository;
import com.ijse.MediFind.repository.ReservationRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PharmacyBranchRepository pharmacyBranchRepository;

    @Override
    public ReservationResDTO createReservation(ReservationReqDTO reservationReqDTO) {
        return null;
    }

    @Override
    public ReservationResDTO getReservationById(Long id) {
        return null;
    }

    @Override
    public List<ReservationResDTO> getAllReservations() {
        return List.of();
    }

    @Override
    public ReservationResDTO updateReservation(Long id, ReservationReqDTO reservationReqDTO) {
        return null;
    }

    @Override
    public void deleteReservation(Long id) {

    }
}
