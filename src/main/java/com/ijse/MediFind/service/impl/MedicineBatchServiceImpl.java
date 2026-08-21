package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.MedicineBatchReqDTO;
import com.ijse.MediFind.dto.response.MedicineBatchResDTO;
import com.ijse.MediFind.entity.Medicine;
import com.ijse.MediFind.entity.MedicineBatch;
import com.ijse.MediFind.exception.BadRequestException;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.MedicineBatchRepository;
import com.ijse.MediFind.repository.MedicineRepository;
import com.ijse.MediFind.service.MedicineBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.sql.internal.ParameterRecognizerImpl;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@Slf4j
@RequiredArgsConstructor
public class MedicineBatchServiceImpl implements MedicineBatchService {

    private final MedicineBatchRepository medicineBatchRepository;
    private final MedicineRepository medicineRepository;

    @Override
    public MedicineBatchResDTO createBatch(MedicineBatchReqDTO medicineBatchReqDTO) {

        if (medicineBatchRepository
                .existsByBatchNumber(medicineBatchReqDTO.getBatchNumber())) {

            throw new BadRequestException(
                    "Medicine batch already exists with batch number: "
                            + medicineBatchReqDTO.getBatchNumber()
            );
        }

        Medicine medicine = medicineRepository
                .findById(medicineBatchReqDTO.getMedicineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: "
                                        + medicineBatchReqDTO.getMedicineId()
                        )
                );

        MedicineBatch medicineBatch = MedicineBatch.builder()
                .batchNumber(medicineBatchReqDTO.getBatchNumber())
                .quantity(medicineBatchReqDTO.getQuantity())
                .expiryDate(medicineBatchReqDTO.getExpiryDate())
                .manufactureDate(medicineBatchReqDTO.getManufactureDate())
                .unitPrice(medicineBatchReqDTO.getUnitPrice())
                .medicine(medicine)
                .build();

        MedicineBatch savedBatch =
                medicineBatchRepository.save(medicineBatch);

        return MedicineBatchResDTO.builder()
                .id(savedBatch.getId())
                .batchNumber(savedBatch.getBatchNumber())
                .quantity(savedBatch.getQuantity())
                .expiryDate(savedBatch.getExpiryDate())
                .manufactureDate(savedBatch.getManufactureDate())
                .unitPrice(savedBatch.getUnitPrice())
                .medicineId(savedBatch.getMedicine().getId())
                .build();

    }

    @Override
    public MedicineBatchResDTO getBatchById(Long id) {

        MedicineBatch medicineBatch =
                medicineBatchRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine batch not found with id: " + id
                                )
                        );

        return MedicineBatchResDTO.builder()
                .id(medicineBatch.getId())
                .batchNumber(medicineBatch.getBatchNumber())
                .quantity(medicineBatch.getQuantity())
                .expiryDate(medicineBatch.getExpiryDate())
                .manufactureDate(medicineBatch.getManufactureDate())
                .unitPrice(medicineBatch.getUnitPrice())
                .medicineId(medicineBatch.getMedicine().getId())
                .build();
    }

    @Override
    public List<MedicineBatchResDTO> getAllBatches() {

        return medicineBatchRepository.findAll()
                .stream()
                .map(batch -> MedicineBatchResDTO.builder()
                        .id(batch.getId())
                        .batchNumber(batch.getBatchNumber())
                        .quantity(batch.getQuantity())
                        .expiryDate(batch.getExpiryDate())
                        .manufactureDate(batch.getManufactureDate())
                        .unitPrice(batch.getUnitPrice())
                        .medicineId(batch.getMedicine().getId())
                        .build()
                )
                .toList();
    }

    @Override
    public MedicineBatchResDTO updateBatch(
            Long id,
            MedicineBatchReqDTO medicineBatchReqDTO) {

        MedicineBatch medicineBatch =
                medicineBatchRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine batch not found with id: " + id
                                )
                        );

        if (!medicineBatch.getBatchNumber()
                .equals(medicineBatchReqDTO.getBatchNumber())
                && medicineBatchRepository.existsByBatchNumber(
                medicineBatchReqDTO.getBatchNumber())) {

            throw new BadRequestException(
                    "Medicine batch already exists with batch number: "
                            + medicineBatchReqDTO.getBatchNumber()
            );
        }

        Medicine medicine = medicineRepository
                .findById(medicineBatchReqDTO.getMedicineId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: "
                                        + medicineBatchReqDTO.getMedicineId()
                        )
                );

        medicineBatch.setBatchNumber(
                medicineBatchReqDTO.getBatchNumber()
        );

        medicineBatch.setQuantity(
                medicineBatchReqDTO.getQuantity()
        );

        medicineBatch.setExpiryDate(
                medicineBatchReqDTO.getExpiryDate()
        );

        medicineBatch.setManufactureDate(
                medicineBatchReqDTO.getManufactureDate()
        );

        medicineBatch.setUnitPrice(
                medicineBatchReqDTO.getUnitPrice()
        );

        medicineBatch.setMedicine(medicine);

        MedicineBatch updatedBatch =
                medicineBatchRepository.save(medicineBatch);

        return MedicineBatchResDTO.builder()
                .id(updatedBatch.getId())
                .batchNumber(updatedBatch.getBatchNumber())
                .quantity(updatedBatch.getQuantity())
                .expiryDate(updatedBatch.getExpiryDate())
                .manufactureDate(updatedBatch.getManufactureDate())
                .unitPrice(updatedBatch.getUnitPrice())
                .medicineId(updatedBatch.getMedicine().getId())
                .build();
    }

    @Override
    public void deleteBatch(Long id) {

        MedicineBatch medicineBatch =
                medicineBatchRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine batch not found with id: " + id
                                )
                        );

        medicineBatchRepository.delete(medicineBatch);
    }
}
