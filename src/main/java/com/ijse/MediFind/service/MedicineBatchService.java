package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.MedicineBatchReqDTO;
import com.ijse.MediFind.dto.response.MedicineBatchResDTO;

import java.util.List;


public interface MedicineBatchService {

    MedicineBatchResDTO createBatch(MedicineBatchReqDTO medicineBatchReqDTO);

    MedicineBatchResDTO getBatchById(Long id);

    List<MedicineBatchResDTO> getAllBatches();

    MedicineBatchResDTO updateBatch(Long id, MedicineBatchReqDTO medicineBatchReqDTO
    );

    void deleteBatch(Long id);
}
