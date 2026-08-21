package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.PharmacyReqDTO;
import com.ijse.MediFind.dto.response.PharmacyResDTO;
import com.ijse.MediFind.entity.Pharmacy;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.PharmacyRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PharmacyServiceImpl implements PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final UserRepository userRepository;


    @Override
    public PharmacyResDTO createPharmacy(
            PharmacyReqDTO pharmacyReqDTO) {

        User owner = null;

        if (pharmacyReqDTO.getOwnerId() != null) {

            owner = userRepository
                    .findById(pharmacyReqDTO.getOwnerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found with id: "
                                            + pharmacyReqDTO.getOwnerId()
                            )
                    );
        }

        Pharmacy pharmacy = Pharmacy.builder()
                .name(pharmacyReqDTO.getName())
                .registrationNumber(
                        pharmacyReqDTO.getRegistrationNumber()
                )
                .phone(pharmacyReqDTO.getPhone())
                .email(pharmacyReqDTO.getEmail())
                .address(pharmacyReqDTO.getAddress())
                .city(pharmacyReqDTO.getCity())
                .owner(owner)
                .build();

        Pharmacy savedPharmacy =
                pharmacyRepository.save(pharmacy);

        return PharmacyResDTO.builder()
                .id(savedPharmacy.getId())
                .name(savedPharmacy.getName())
                .registrationNumber(
                        savedPharmacy.getRegistrationNumber()
                )
                .phone(savedPharmacy.getPhone())
                .email(savedPharmacy.getEmail())
                .address(savedPharmacy.getAddress())
                .city(savedPharmacy.getCity())
                .ownerId(
                        savedPharmacy.getOwner() != null
                                ? savedPharmacy.getOwner().getId()
                                : null
                )
                .build();
    }

    @Override
    public PharmacyResDTO getPharmacyById(Long id) {
        Pharmacy pharmacy = pharmacyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found with id: " + id
                                )
                        );

        return PharmacyResDTO.builder()
                .id(pharmacy.getId())
                .name(pharmacy.getName())
                .registrationNumber(
                        pharmacy.getRegistrationNumber()
                )
                .phone(pharmacy.getPhone())
                .email(pharmacy.getEmail())
                .address(pharmacy.getAddress())
                .city(pharmacy.getCity())
                .ownerId(
                        pharmacy.getOwner() != null
                                ? pharmacy.getOwner().getId()
                                : null
                )
                .build();
    }

    @Override
    public List<PharmacyResDTO> getAllPharmacies() {
        return pharmacyRepository.findAll()
                .stream()
                .map(pharmacy -> PharmacyResDTO.builder()
                        .id(pharmacy.getId())
                        .name(pharmacy.getName())
                        .registrationNumber(
                                pharmacy.getRegistrationNumber()
                        )
                        .phone(pharmacy.getPhone())
                        .email(pharmacy.getEmail())
                        .address(pharmacy.getAddress())
                        .city(pharmacy.getCity())
                        .ownerId(
                                pharmacy.getOwner() != null
                                        ? pharmacy.getOwner().getId()
                                        : null
                        )
                        .build()
                )
                .toList();
    }

    @Override
    public PharmacyResDTO updatePharmacy(Long id, PharmacyReqDTO pharmacyReqDTO) {
        Pharmacy pharmacy =  pharmacyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found with id: " + id
                                )
                        );

        User owner = null;

        if (pharmacyReqDTO.getOwnerId() != null) {

            owner = userRepository
                    .findById(pharmacyReqDTO.getOwnerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found with id: "
                                            + pharmacyReqDTO.getOwnerId()
                            )
                    );
        }

        pharmacy.setName(pharmacyReqDTO.getName());

        pharmacy.setRegistrationNumber(pharmacyReqDTO.getRegistrationNumber());

        pharmacy.setPhone(pharmacyReqDTO.getPhone());

        pharmacy.setEmail(pharmacyReqDTO.getEmail());

        pharmacy.setAddress(pharmacyReqDTO.getAddress());

        pharmacy.setCity(pharmacyReqDTO.getCity());

        pharmacy.setOwner(owner);

        Pharmacy updatedPharmacy = pharmacyRepository.save(pharmacy);

        return PharmacyResDTO.builder()
                .id(updatedPharmacy.getId())
                .name(updatedPharmacy.getName())
                .registrationNumber(
                        updatedPharmacy.getRegistrationNumber()
                )
                .phone(updatedPharmacy.getPhone())
                .email(updatedPharmacy.getEmail())
                .address(updatedPharmacy.getAddress())
                .city(updatedPharmacy.getCity())
                .ownerId(
                        updatedPharmacy.getOwner() != null
                                ? updatedPharmacy.getOwner().getId()
                                : null
                )
                .build();
    }

    @Override
    public void deletePharmacy(Long id) {

        Pharmacy pharmacy =
                pharmacyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy not found with id: " + id
                                )
                        );

        pharmacyRepository.delete(pharmacy);

    }
}
