package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.InventoryReqDTO;
import com.ijse.MediFind.dto.response.InventoryResDTO;
import com.ijse.MediFind.entity.Inventory;
import com.ijse.MediFind.entity.MedicineBatch;
import com.ijse.MediFind.entity.PharmacyBranch;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.InventoryRepository;
import com.ijse.MediFind.repository.MedicineBatchRepository;
import com.ijse.MediFind.repository.PharmacyBranchRepository;
import com.ijse.MediFind.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final PharmacyBranchRepository pharmacyBranchRepository;
    private final MedicineBatchRepository medicineBatchRepository;

    @Override
    public InventoryResDTO createInventory(InventoryReqDTO inventoryReqDTO) {

        PharmacyBranch pharmacyBranch = pharmacyBranchRepository
                        .findById(inventoryReqDTO.getPharmacyBranchId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy branch not found with id: "
                                                + inventoryReqDTO.getPharmacyBranchId()
                                )
                        );

        MedicineBatch medicineBatch =
                medicineBatchRepository
                        .findById(inventoryReqDTO.getMedicineBatchId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine batch not found with id: "
                                                + inventoryReqDTO.getMedicineBatchId()
                                )
                        );

        Inventory inventory = Inventory.builder()
                .pharmacyBranch(pharmacyBranch)
                .medicineBatch(medicineBatch)
                .quantity(inventoryReqDTO.getQuantity())
                .reorderLevel(inventoryReqDTO.getReorderLevel())
                .lastUpdated(LocalDateTime.now())
                .build();

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return InventoryResDTO.builder()
                .id(savedInventory.getId())
                .pharmacyBranchId(
                        savedInventory.getPharmacyBranch().getId()
                )
                .medicineBatchId(
                        savedInventory.getMedicineBatch().getId()
                )
                .quantity(savedInventory.getQuantity())
                .reorderLevel(savedInventory.getReorderLevel())
                .lastUpdated(savedInventory.getLastUpdated())
                .build();

    }

    @Override
    public InventoryResDTO getInventoryById(Long id) {

       Inventory inventory = inventoryRepository.findById(id)
       .orElseThrow(() ->
               new ResourceNotFoundException(
                       "Inventory not found with id: " + id)
       );
       return InventoryResDTO.builder()
               .id(inventory.getId())
               .pharmacyBranchId(inventory.getPharmacyBranch().getId())
               .medicineBatchId(inventory.getMedicineBatch().getId())
               .quantity(inventory.getQuantity())
               .reorderLevel(inventory.getReorderLevel())
               .lastUpdated(inventory.getLastUpdated())
               .build();
    }

    @Override
    public List<InventoryResDTO> getAllInventories() {

        return inventoryRepository.findAll()
                .stream()
                .map(inventory -> InventoryResDTO.builder()
                        .id(inventory.getId())
                        .pharmacyBranchId(inventory.getPharmacyBranch().getId())
                        .medicineBatchId(inventory.getMedicineBatch().getId())
                        .quantity(inventory.getQuantity())
                        .reorderLevel(inventory.getReorderLevel())
                        .lastUpdated(inventory.getLastUpdated())
                        .build()
                )
                .toList();

    }

    @Override
    public InventoryResDTO updateInventory(Long id, InventoryReqDTO inventoryReqDTO) {
        Inventory inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found with id: " + id
                                )
                        );

        PharmacyBranch pharmacyBranch =
                pharmacyBranchRepository
                        .findById(inventoryReqDTO.getPharmacyBranchId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pharmacy branch not found with id: "
                                                + inventoryReqDTO.getPharmacyBranchId()
                                )
                        );

        MedicineBatch medicineBatch =
                medicineBatchRepository
                        .findById(inventoryReqDTO.getMedicineBatchId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine batch not found with id: "
                                                + inventoryReqDTO.getMedicineBatchId()
                                )
                        );

        inventory.setPharmacyBranch(pharmacyBranch);

        inventory.setMedicineBatch(medicineBatch);

        inventory.setQuantity(
                inventoryReqDTO.getQuantity()
        );

        inventory.setReorderLevel(
                inventoryReqDTO.getReorderLevel()
        );

        inventory.setLastUpdated(
                LocalDateTime.now()
        );

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return InventoryResDTO.builder()
                .id(updatedInventory.getId())
                .pharmacyBranchId(
                        updatedInventory.getPharmacyBranch().getId()
                )
                .medicineBatchId(
                        updatedInventory.getMedicineBatch().getId()
                )
                .quantity(updatedInventory.getQuantity())
                .reorderLevel(updatedInventory.getReorderLevel())
                .lastUpdated(updatedInventory.getLastUpdated())
                .build();
    }

    @Override
    public void deleteInventory(Long id) {

        Inventory inventory = inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found with id: " + id
                                )
                        );

        inventoryRepository.delete(inventory);
    }
}
