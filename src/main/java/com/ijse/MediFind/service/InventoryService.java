package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.InventoryReqDTO;
import com.ijse.MediFind.dto.response.InventoryResDTO;

import java.util.List;

public interface InventoryService {

    InventoryResDTO createInventory(InventoryReqDTO inventoryReqDTO);

    InventoryResDTO getInventoryById(Long id);

    List<InventoryResDTO> getAllInventories();

    InventoryResDTO updateInventory(
            Long id,
            InventoryReqDTO inventoryReqDTO
    );

    void deleteInventory(Long id);
}
