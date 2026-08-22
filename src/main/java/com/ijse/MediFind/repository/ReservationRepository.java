package com.ijse.MediFind.repository;


import com.ijse.MediFind.entity.Reservation;
import com.ijse.MediFind.entity.ReservationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
