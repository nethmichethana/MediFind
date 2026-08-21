package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.PharmacyReqDTO;
import com.ijse.MediFind.dto.response.PharmacyResDTO;
import java.util.List;


public interface PharmacyService {

    PharmacyResDTO createPharmacy(PharmacyReqDTO pharmacyReqDTO);

    PharmacyResDTO getPharmacyById(Long id);

    List<PharmacyResDTO> getAllPharmacies();

    PharmacyResDTO updatePharmacy(Long id, PharmacyReqDTO pharmacyReqDTO);

    void deletePharmacy(Long id);
}
