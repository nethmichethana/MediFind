package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.MedicineReqDTO;
import com.ijse.MediFind.dto.response.MedicineResDTO;
import com.ijse.MediFind.entity.Medicine;
import com.ijse.MediFind.entity.MedicineCategory;
import com.ijse.MediFind.exception.BadRequestException;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.MedicineCategoryRepository;
import com.ijse.MediFind.repository.MedicineRepository;
import com.ijse.MediFind.service.MedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository medicineCategoryRepository;

    @Override
    public MedicineResDTO createMedicine(MedicineReqDTO medicineReqDTO) {
        if (medicineRepository.existsByName(medicineReqDTO.getName())) {
            throw new BadRequestException(
                    "Medicine already exists with name: "
                            + medicineReqDTO.getName()
            );
        }
        MedicineCategory category =
                medicineCategoryRepository.findById(
                        medicineReqDTO.getCategoryId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine category not found with id: "
                                        + medicineReqDTO.getCategoryId()
                        )
                );
        LocalDateTime now = LocalDateTime.now();

        Medicine medicine = Medicine.builder()
                .name(medicineReqDTO.getName())
                .genericName(medicineReqDTO.getGenericName())
                .brandName(medicineReqDTO.getBrandName())
                .dosageForm(medicineReqDTO.getDosageForm())
                .strength(medicineReqDTO.getStrength())
                .description(medicineReqDTO.getDescription())
                .category(category)
                .prescriptionRequired(
                        medicineReqDTO.getPrescriptionRequired()
                )
                .active(medicineReqDTO.getActive())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Medicine savedMedicine = medicineRepository.save(medicine);



        return MedicineResDTO.builder()
                .id(savedMedicine.getId())
                .name(savedMedicine.getName())
                .genericName(savedMedicine.getGenericName())
                .brandName(savedMedicine.getBrandName())
                .dosageForm(savedMedicine.getDosageForm())
                .strength(savedMedicine.getStrength())
                .description(savedMedicine.getDescription())
                .categoryId(savedMedicine.getCategory().getId())
                .prescriptionRequired(
                        savedMedicine.getPrescriptionRequired()
                )
                .active(savedMedicine.getActive())
                .createdAt(savedMedicine.getCreatedAt())
                .updatedAt(savedMedicine.getUpdatedAt())
                .build();
    }

    @Override
    public MedicineResDTO getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: " + id
                        )
                );

        return MedicineResDTO.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .brandName(medicine.getBrandName())
                .dosageForm(medicine.getDosageForm())
                .strength(medicine.getStrength())
                .description(medicine.getDescription())
                .categoryId(medicine.getCategory().getId())
                .prescriptionRequired(
                        medicine.getPrescriptionRequired()
                )
                .active(medicine.getActive())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }

    @Override
    public List<MedicineResDTO> getAllMedicines() {
        return medicineRepository.findAll()
                .stream()
                .map(medicine -> MedicineResDTO.builder()
                        .id(medicine.getId())
                        .name(medicine.getName())
                        .genericName(medicine.getGenericName())
                        .brandName(medicine.getBrandName())
                        .dosageForm(medicine.getDosageForm())
                        .strength(medicine.getStrength())
                        .description(medicine.getDescription())
                        .categoryId(medicine.getCategory().getId())
                        .prescriptionRequired(
                                medicine.getPrescriptionRequired()
                        )
                        .active(medicine.getActive())
                        .createdAt(medicine.getCreatedAt())
                        .updatedAt(medicine.getUpdatedAt())
                        .build()
                )
                .toList();
    }

    @Override
    public MedicineResDTO updateMedicine(Long id, MedicineReqDTO medicineReqDTO) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: " + id
                        )
                );

        if (!medicine.getName().equals(medicineReqDTO.getName())
                && medicineRepository.existsByName(
                medicineReqDTO.getName())) {

            throw new BadRequestException(
                    "Medicine already exists with name: "
                            + medicineReqDTO.getName()
            );
        }

        MedicineCategory category =
                medicineCategoryRepository.findById(
                        medicineReqDTO.getCategoryId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine category not found with id: "
                                        + medicineReqDTO.getCategoryId()
                        )
                );

        medicine.setName(medicineReqDTO.getName());
        medicine.setGenericName(medicineReqDTO.getGenericName());
        medicine.setBrandName(medicineReqDTO.getBrandName());
        medicine.setDosageForm(medicineReqDTO.getDosageForm());
        medicine.setStrength(medicineReqDTO.getStrength());
        medicine.setDescription(medicineReqDTO.getDescription());
        medicine.setCategory(category);
        medicine.setPrescriptionRequired(medicineReqDTO.getPrescriptionRequired()
        );
        medicine.setActive(medicineReqDTO.getActive());
        medicine.setUpdatedAt(LocalDateTime.now());

        Medicine updatedMedicine =
                medicineRepository.save(medicine);

        return MedicineResDTO.builder()
                .id(updatedMedicine.getId())
                .name(updatedMedicine.getName())
                .genericName(updatedMedicine.getGenericName())
                .brandName(updatedMedicine.getBrandName())
                .dosageForm(updatedMedicine.getDosageForm())
                .strength(updatedMedicine.getStrength())
                .description(updatedMedicine.getDescription())
                .categoryId(updatedMedicine.getCategory().getId())
                .prescriptionRequired(
                        updatedMedicine.getPrescriptionRequired()
                )
                .active(updatedMedicine.getActive())
                .createdAt(updatedMedicine.getCreatedAt())
                .updatedAt(updatedMedicine.getUpdatedAt())
                .build();


    }

    @Override
    public void deleteMedicine(Long id) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: " + id
                        )
                );

        medicineRepository.delete(medicine);
    }
}
