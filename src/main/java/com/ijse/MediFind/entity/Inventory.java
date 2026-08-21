package com.ijse.MediFind.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private PharmacyBranch pharmacyBranch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private MedicineBatch medicineBatch;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;
}