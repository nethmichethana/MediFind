package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.PharmacyBranchReqDTO;
import com.ijse.MediFind.dto.response.PharmacyBranchResDTO;
import com.ijse.MediFind.service.PharmacyBranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class PharmacyBranchController {

    private final PharmacyBranchService pharmacyBranchService;

    @PostMapping("/pharmacy-branches")
    public CommonResponse createBranch(
            @RequestBody PharmacyBranchReqDTO pharmacyBranchReqDTO) {

        PharmacyBranchResDTO pharmacyBranch = pharmacyBranchService.createBranch(pharmacyBranchReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacyBranch,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/pharmacy-branches/{id}")
    public CommonResponse getBranchById(
            @PathVariable Long id) {

        PharmacyBranchResDTO pharmacyBranch = pharmacyBranchService.getBranchById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacyBranch,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/pharmacy-branches")
    public CommonResponse getAllBranches() {

        List<PharmacyBranchResDTO> branchList = pharmacyBranchService.getAllBranches();

        return new CommonResponse(
                OPERATION_SUCCESS,
                branchList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/pharmacy-branches/{id}")
    public CommonResponse updateBranch(
            @PathVariable Long id,
            @RequestBody PharmacyBranchReqDTO pharmacyBranchReqDTO) {

        PharmacyBranchResDTO pharmacyBranch = pharmacyBranchService.updateBranch(id, pharmacyBranchReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                pharmacyBranch,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/pharmacy-branches/{id}")
    public CommonResponse deleteBranch(
            @PathVariable Long id) {

        pharmacyBranchService.deleteBranch(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }
}
