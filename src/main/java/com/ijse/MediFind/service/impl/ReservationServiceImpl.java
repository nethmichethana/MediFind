package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.ReservationReqDTO;
import com.ijse.MediFind.dto.response.ReservationResDTO;
import com.ijse.MediFind.entity.PharmacyBranch;
import com.ijse.MediFind.entity.Reservation;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.PharmacyBranchRepository;
import com.ijse.MediFind.repository.ReservationRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
       User user = userRepository.findById(reservationReqDTO.getUserId())
               .orElseThrow(()->
                       new ResourceNotFoundException(
                               "User Not Found With Id : "
                                       + reservationReqDTO.getUserId()
                       )
               );
        PharmacyBranch pharmacyBranch = pharmacyBranchRepository
                .findById(reservationReqDTO.getPharmacyBranchId())
                .orElseThrow(()->
                        new ResourceNotFoundException(
                                "Pharmacy Branch Not Found With Id : "
                                + reservationReqDTO.getPharmacyBranchId()
                        )
                );
        Reservation reservation = Reservation.builder()
                .reservationDate(
                        reservationReqDTO.getReservationDate() != null
                        ? reservationReqDTO.getReservationDate()
                                : LocalDateTime.now()
                )
                .pickupDate(reservationReqDTO.getPickupDate())
                .status(reservationReqDTO.getStatus())
                .notes(reservationReqDTO.getNotes())
                .user(user)
                .pharmacyBranch(pharmacyBranch)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        return ReservationResDTO.builder()
                .id(savedReservation.getId())
                .reservationDate(savedReservation.getReservationDate())
                .pickupDate(savedReservation.getPickupDate())
                .status(savedReservation.getStatus())
                .notes(savedReservation.getNotes())
                .userId(savedReservation.getUser().getId())
                .pharmacyBranchId(savedReservation.getPharmacyBranch().getId())
                .build();
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
