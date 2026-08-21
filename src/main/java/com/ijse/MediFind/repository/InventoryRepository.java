package com.ijse.MediFind.repository;

import com.ijse.MediFind.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface InventoryRepository extends JpaRepository<Inventory,Long> {
}
