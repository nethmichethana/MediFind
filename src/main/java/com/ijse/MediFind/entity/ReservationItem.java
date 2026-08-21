package com.ijse.MediFind.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservation_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReservationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;
}
