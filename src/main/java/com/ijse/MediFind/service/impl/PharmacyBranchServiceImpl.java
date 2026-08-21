package com.ijse.MediFind.service.impl;


import com.ijse.MediFind.dto.request.PharmacyBranchReqDTO;
import com.ijse.MediFind.dto.response.PharmacyBranchResDTO;
import com.ijse.MediFind.entity.Pharmacy;
import com.ijse.MediFind.entity.PharmacyBranch;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.PharmacyBranchRepository;
import com.ijse.MediFind.repository.PharmacyRepository;
import com.ijse.MediFind.service.PharmacyBranchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PharmacyBranchServiceImpl implements PharmacyBranchService {

    private final PharmacyBranchRepository pharmacyBranchRepository;
    private final PharmacyRepository pharmacyRepository;

    @Override
    public PharmacyBranchResDTO createBranch(PharmacyBranchReqDTO pharmacyBranchReqDTO) {
        Pharmacy pharmacy = pharmacyRepository
                .findById(pharmacyBranchReqDTO.getPharmacyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pharmacy not found with id: "
                                        + pharmacyBranchReqDTO.getPharmacyId()
                        )
                );

        PharmacyBranch pharmacyBranch = PharmacyBranch.builder()
                .name(pharmacyBranchReqDTO.getName())
                .address(pharmacyBranchReqDTO.getAddress())
                .city(pharmacyBranchReqDTO.getCity())
                .phone(pharmacyBranchReqDTO.getPhone())
                .email(pharmacyBranchReqDTO.getEmail())
                .latitude(pharmacyBranchReqDTO.getLatitude())
                .longitude(pharmacyBranchReqDTO.getLongitude())
                .active(pharmacyBranchReqDTO.getActive() != null
                        ? pharmacyBranchReqDTO.getActive()
                        : true)
                .pharmacy(pharmacy)
                .build();

        PharmacyBranch savedBranch = pharmacyBranchRepository.save(pharmacyBranch);

        return PharmacyBranchResDTO.builder()
                .id(savedBranch.getId())
                .name(savedBranch.getName())
                .address(savedBranch.getAddress())
                .city(savedBranch.getCity())
                .phone(savedBranch.getPhone())
                .email(savedBranch.getEmail())
                .latitude(savedBranch.getLatitude())
                .longitude(savedBranch.getLongitude())
                .active(savedBranch.getActive())
                .pharmacyId(savedBranch.getPharmacy().getId())
                .build();
    }

    @Override
    public PharmacyBranchResDTO getBranchById(Long id) {
        PharmacyBranch pharmacyBranch =
                pharmacyBranchRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy branch not found with id: " + id
                                )
                        );

        return PharmacyBranchResDTO.builder()
                .id(pharmacyBranch.getId())
                .name(pharmacyBranch.getName())
                .address(pharmacyBranch.getAddress())
                .city(pharmacyBranch.getCity())
                .phone(pharmacyBranch.getPhone())
                .email(pharmacyBranch.getEmail())
                .latitude(pharmacyBranch.getLatitude())
                .longitude(pharmacyBranch.getLongitude())
                .active(pharmacyBranch.getActive())
                .pharmacyId(pharmacyBranch.getPharmacy().getId())
                .build();
    }

    @Override
    public List<PharmacyBranchResDTO> getAllBranches() {
        return pharmacyBranchRepository.findAll()
                .stream()
                .map(branch -> PharmacyBranchResDTO.builder()
                        .id(branch.getId())
                        .name(branch.getName())
                        .address(branch.getAddress())
                        .city(branch.getCity())
                        .phone(branch.getPhone())
                        .email(branch.getEmail())
                        .latitude(branch.getLatitude())
                        .longitude(branch.getLongitude())
                        .active(branch.getActive())
                        .pharmacyId(branch.getPharmacy().getId())
                        .build()
                )
                .toList();
    }

    @Override
    public PharmacyBranchResDTO updateBranch(Long id, PharmacyBranchReqDTO pharmacyBranchReqDTO) {

        PharmacyBranch pharmacyBranch =
                pharmacyBranchRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy branch not found with id: " + id
                                )
                        );

        Pharmacy pharmacy = pharmacyRepository
                .findById(pharmacyBranchReqDTO.getPharmacyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pharmacy not found with id: "
                                        + pharmacyBranchReqDTO.getPharmacyId()
                        )
                );

        pharmacyBranch.setName(pharmacyBranchReqDTO.getName());

        pharmacyBranch.setAddress(pharmacyBranchReqDTO.getAddress());

        pharmacyBranch.setCity(pharmacyBranchReqDTO.getCity());

        pharmacyBranch.setPhone(pharmacyBranchReqDTO.getPhone());

        pharmacyBranch.setEmail(pharmacyBranchReqDTO.getEmail());

        pharmacyBranch.setLatitude(pharmacyBranchReqDTO.getLatitude());

        pharmacyBranch.setLongitude(pharmacyBranchReqDTO.getLongitude());

        pharmacyBranch.setActive(pharmacyBranchReqDTO.getActive());

        pharmacyBranch.setPharmacy(pharmacy);

        PharmacyBranch updatedBranch = pharmacyBranchRepository.save(pharmacyBranch);

        return PharmacyBranchResDTO.builder()
                .id(updatedBranch.getId())
                .name(updatedBranch.getName())
                .address(updatedBranch.getAddress())
                .city(updatedBranch.getCity())
                .phone(updatedBranch.getPhone())
                .email(updatedBranch.getEmail())
                .latitude(updatedBranch.getLatitude())
                .longitude(updatedBranch.getLongitude())
                .active(updatedBranch.getActive())
                .pharmacyId(updatedBranch.getPharmacy().getId())
                .build();
    }

    @Override
    public void deleteBranch(Long id) {
        PharmacyBranch pharmacyBranch = pharmacyBranchRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy branch not found with id: " + id
                                )
                        );

        pharmacyBranchRepository.delete(pharmacyBranch);
    }
}
