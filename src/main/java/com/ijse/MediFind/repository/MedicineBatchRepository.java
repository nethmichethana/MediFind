package com.ijse.MediFind.repository;

import com.ijse.MediFind.dto.request.MedicineBatchReqDTO;
import com.ijse.MediFind.entity.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineBatchRepository extends JpaRepository<MedicineBatch,Long> {

    boolean existsByBatchNumber(String medicineBatchReqDTO);
}
