package com.ijse.MediFind.repository;

import com.ijse.MediFind.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    boolean existsByName(String name);

    @Query("SELECT m FROM Medicine m WHERE " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.brandName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.dosageForm) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.strength) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Medicine> filterMedicines(@Param("categoryId") Long categoryId, @Param("search") String search);
}

