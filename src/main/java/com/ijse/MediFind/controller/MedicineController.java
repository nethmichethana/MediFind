package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.MedicineReqDTO;
import com.ijse.MediFind.dto.response.MedicineResDTO;
import com.ijse.MediFind.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping("/medicines")
    public CommonResponse createMedicine(
            @RequestBody MedicineReqDTO medicineReqDTO) {

        MedicineResDTO medicine =
                medicineService.createMedicine(medicineReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicine,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/medicines/{id}")
    public CommonResponse getMedicineById(
            @PathVariable Long id) {

        MedicineResDTO medicine =
                medicineService.getMedicineById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicine,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/medicines")
    public CommonResponse getAllMedicines() {

        List<MedicineResDTO> medicineList =
                medicineService.getAllMedicines();

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/medicines/{id}")
    public CommonResponse updateMedicine(
            @PathVariable Long id,
            @RequestBody MedicineReqDTO medicineReqDTO) {

        MedicineResDTO medicine =
                medicineService.updateMedicine(
                        id,
                        medicineReqDTO
                );

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicine,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/medicines/{id}")
    public CommonResponse deleteMedicine(
            @PathVariable Long id) {

        medicineService.deleteMedicine(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }
}