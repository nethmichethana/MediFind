package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.MedicineCategoryReqDTO;
import com.ijse.MediFind.dto.response.MedicineCategoryResDTO;
import com.ijse.MediFind.service.MedicineCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class MedicineCategoryController {

    private final MedicineCategoryService medicineCategoryService;

    @PostMapping("/medicine-categories")
    public CommonResponse createCategory(
            @RequestBody MedicineCategoryReqDTO medicineCategoryReqDTO) {

        MedicineCategoryResDTO medicineCategory =
                medicineCategoryService.createCategory(medicineCategoryReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineCategory,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/medicine-categories/{id}")
    public CommonResponse getCategoryById(
            @PathVariable Long id) {

        MedicineCategoryResDTO medicineCategory =
                medicineCategoryService.getCategoryById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineCategory,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/medicine-categories")
    public CommonResponse getAllCategories() {

        List<MedicineCategoryResDTO> categoryList =
                medicineCategoryService.getAllCategories();

        return new CommonResponse(
                OPERATION_SUCCESS,
                categoryList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/medicine-categories/{id}")
    public CommonResponse updateCategory(
            @PathVariable Long id,
            @RequestBody MedicineCategoryReqDTO medicineCategoryReqDTO) {

        MedicineCategoryResDTO medicineCategory =
                medicineCategoryService.updateCategory(
                        id,
                        medicineCategoryReqDTO
                );

        return new CommonResponse(
                OPERATION_SUCCESS,
                medicineCategory,
                SUCCESS_MESSAGE
        );
    }

    @DeleteMapping("/medicine-categories/{id}")
    public CommonResponse deleteCategory(
            @PathVariable Long id) {

        medicineCategoryService.deleteCategory(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }
}