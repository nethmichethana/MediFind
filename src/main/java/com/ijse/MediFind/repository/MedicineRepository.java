package com.ijse.MediFind.repository;

import com.ijse.MediFind.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface MedicineRepository extends JpaRepository<Medicine,Long> {

    boolean existsByName(String name);
}
