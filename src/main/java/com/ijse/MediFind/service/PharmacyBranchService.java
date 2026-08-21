package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.PharmacyBranchReqDTO;
import com.ijse.MediFind.dto.response.PharmacyBranchResDTO;

import java.util.List;

public interface PharmacyBranchService {
    PharmacyBranchResDTO createBranch(PharmacyBranchReqDTO pharmacyBranchReqDTO);

    PharmacyBranchResDTO getBranchById(Long id);

    List<PharmacyBranchResDTO> getAllBranches();

    PharmacyBranchResDTO updateBranch(Long id, PharmacyBranchReqDTO pharmacyBranchReqDTO);

    void deleteBranch(Long id);
}
