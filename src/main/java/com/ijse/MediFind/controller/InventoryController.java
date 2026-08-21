package com.ijse.MediFind.controller;

import com.ijse.MediFind.dto.request.InventoryReqDTO;
import com.ijse.MediFind.dto.response.CommonResponse;
import com.ijse.MediFind.dto.response.InventoryResDTO;
import com.ijse.MediFind.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/inventories")
    public CommonResponse createInventory(@RequestBody InventoryReqDTO inventoryReqDTO) {

        InventoryResDTO inventoryResDTO =  inventoryService.createInventory(inventoryReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE

        );
    }
    @GetMapping("/inventories/{id}")
    public CommonResponse getInventoryById(
            @PathVariable Long id) {

        InventoryResDTO inventory =
                inventoryService.getInventoryById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/inventories")
    public CommonResponse getAllInventories() {

        List<InventoryResDTO> inventoryList =
                inventoryService.getAllInventories();

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/inventories/{id}")
    public CommonResponse updateInventory(
            @PathVariable Long id,
            @RequestBody InventoryReqDTO inventoryReqDTO) {

        InventoryResDTO inventory =
                inventoryService.updateInventory(
                        id,
                        inventoryReqDTO
                );

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/inventories/{id}")
    public CommonResponse deleteInventory(
            @PathVariable Long id) {

        inventoryService.deleteInventory(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }


}
