package com.ijse.MediFind.controller;


import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.PharmacyReqDTO;
import com.ijse.MediFind.dto.response.PharmacyResDTO;
import com.ijse.MediFind.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @PostMapping("/pharmacies")
    public CommonResponse createPharmacy(@RequestBody PharmacyReqDTO pharmacyReqDTO) {

        PharmacyResDTO pharmacy = pharmacyService.createPharmacy(pharmacyReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacy,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/pharmacies/{id}")
    public CommonResponse getPharmacyById(@PathVariable Long id) {

        PharmacyResDTO pharmacy = pharmacyService.getPharmacyById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacy,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/pharmacies")
    public CommonResponse getAllPharmacies() {

        List<PharmacyResDTO> pharmacyList =
                pharmacyService.getAllPharmacies();

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacyList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/pharmacies/{id}")
    public CommonResponse updatePharmacy(
            @PathVariable Long id,
            @RequestBody PharmacyReqDTO pharmacyReqDTO) {

        PharmacyResDTO pharmacy =
                pharmacyService.updatePharmacy(
                        id,
                        pharmacyReqDTO
                );

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacy,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/pharmacies/{id}")
    public CommonResponse deletePharmacy(
            @PathVariable Long id) {

        pharmacyService.deletePharmacy(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }

}
