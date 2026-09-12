package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.MedicineReqDTO;
import com.ijse.MediFind.dto.response.MedicineResDTO;

import java.util.List;

public interface MedicineService {

    MedicineResDTO createMedicine(MedicineReqDTO medicineReqDTO);

    MedicineResDTO getMedicineById(Long id);

    List<MedicineResDTO> getAllMedicines();

    List<MedicineResDTO> filterMedicines(Long categoryId, String search);

    MedicineResDTO updateMedicine(Long id, MedicineReqDTO medicineReqDTO);

    void deleteMedicine(Long id);
}
