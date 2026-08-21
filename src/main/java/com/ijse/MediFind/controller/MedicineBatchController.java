package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.MedicineBatchReqDTO;
import com.ijse.MediFind.dto.response.MedicineBatchResDTO;
import com.ijse.MediFind.service.MedicineBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class MedicineBatchController {

    private final MedicineBatchService medicineBatchService;

    @PostMapping("/medicine-batches")
    public CommonResponse createBatch(
            @RequestBody MedicineBatchReqDTO medicineBatchReqDTO) {

        MedicineBatchResDTO medicineBatch =
                medicineBatchService.createBatch(medicineBatchReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineBatch,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/medicine-batches/{id}")
    public CommonResponse getBatchById(
            @PathVariable Long id) {

        MedicineBatchResDTO medicineBatch =
                medicineBatchService.getBatchById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineBatch,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/medicine-batches")
    public CommonResponse getAllBatches() {

        List<MedicineBatchResDTO> batchList =
                medicineBatchService.getAllBatches();

        return new CommonResponse(
                OPERATION_SUCCESS,
                batchList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/medicine-batches/{id}")
    public CommonResponse updateBatch(
            @PathVariable Long id,
            @RequestBody MedicineBatchReqDTO medicineBatchReqDTO) {

        MedicineBatchResDTO medicineBatch =
                medicineBatchService.updateBatch(
                        id,
                        medicineBatchReqDTO
                );

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineBatch,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/medicine-batches/{id}")
    public CommonResponse deleteBatch(
            @PathVariable Long id) {

        medicineBatchService.deleteBatch(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }
}
