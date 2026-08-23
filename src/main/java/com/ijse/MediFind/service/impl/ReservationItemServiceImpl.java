package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.ReservationItemReqDTO;
import com.ijse.MediFind.dto.response.ReservationItemResDTO;
import com.ijse.MediFind.entity.Medicine;
import com.ijse.MediFind.entity.Reservation;
import com.ijse.MediFind.entity.ReservationItem;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.MedicineRepository;
import com.ijse.MediFind.repository.ReservationRepository;
import com.ijse.MediFind.repository.ReservationItemRepository;
import com.ijse.MediFind.service.ReservationItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationItemServiceImpl implements ReservationItemService {

    private final ReservationItemRepository reservationItemRepository;
    private final ReservationRepository reservationRepository;
    private final MedicineRepository medicineRepository;


    @Override
    public ReservationItemResDTO createReservationItem(ReservationItemReqDTO reservationItemReqDTO) {
        Reservation reservation = reservationRepository
                .findById(reservationItemReqDTO.getReservationId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation not found with id: "
                                        + reservationItemReqDTO
                                        .getReservationId()
                        )
                );

        Medicine medicine = medicineRepository
                .findById(reservationItemReqDTO.getMedicineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: "
                                        + reservationItemReqDTO
                                        .getMedicineId()
                        )
                );

        ReservationItem reservationItem =
                ReservationItem.builder()
                        .quantity(reservationItemReqDTO.getQuantity())
                        .unitPrice(reservationItemReqDTO.getUnitPrice())
                        .reservation(reservation)
                        .medicine(medicine)
                        .build();

        ReservationItem savedItem = reservationItemRepository.save(reservationItem);

        return ReservationItemResDTO.builder()
                .id(savedItem.getId())
                .quantity(savedItem.getQuantity())
                .unitPrice(savedItem.getUnitPrice())
                .reservationId(savedItem.getReservation().getId())
                .medicineId(savedItem.getMedicine().getId())
                .build();
    }

    @Override
    public ReservationItemResDTO getReservationItemById(Long id) {
        ReservationItem reservationItem =
                reservationItemRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reservation item not found with id: "
                                                + id
                                )
                        );

        return ReservationItemResDTO.builder()
                .id(reservationItem.getId())
                .quantity(reservationItem.getQuantity())
                .unitPrice(reservationItem.getUnitPrice())
                .reservationId(reservationItem.getReservation().getId())
                .medicineId(reservationItem.getMedicine().getId())
                .build();
    }

    @Override
    public List<ReservationItemResDTO> getAllReservationItems() {
        return reservationItemRepository.findAll()
                .stream()
                .map(item ->
                        ReservationItemResDTO.builder()
                                .id(item.getId())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .reservationId(item.getReservation().getId())
                                .medicineId(item.getMedicine().getId())
                                .build()
                )
                .toList();
    }

    @Override
    public ReservationItemResDTO updateReservationItem(Long id, ReservationItemReqDTO reservationItemReqDTO) {
        ReservationItem reservationItem =
                reservationItemRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reservation item not found with id: "
                                                + id
                                )
                        );

        Reservation reservation = reservationRepository
                .findById(
                        reservationItemReqDTO.getReservationId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation not found with id: "
                                        + reservationItemReqDTO
                                        .getReservationId()
                        )
                );

        Medicine medicine = medicineRepository
                .findById(
                        reservationItemReqDTO.getMedicineId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: "
                                        + reservationItemReqDTO
                                        .getMedicineId()
                        )
                );

        reservationItem.setQuantity(reservationItemReqDTO.getQuantity());

        reservationItem.setUnitPrice(reservationItemReqDTO.getUnitPrice());

        reservationItem.setReservation(reservation);

        reservationItem.setMedicine(medicine);

        ReservationItem updatedItem = reservationItemRepository.save(reservationItem);

        return ReservationItemResDTO.builder()
                .id(updatedItem.getId())
                .quantity(updatedItem.getQuantity())
                .unitPrice(updatedItem.getUnitPrice())
                .reservationId(updatedItem.getReservation().getId())
                .medicineId(updatedItem.getMedicine().getId())
                .build();
    }

    @Override
    public void deleteReservationItem(Long id) {
        ReservationItem reservationItem =
                reservationItemRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reservation item not found with id: "
                                                + id
                                )
                        );

        reservationItemRepository.delete(reservationItem);

    }
}
