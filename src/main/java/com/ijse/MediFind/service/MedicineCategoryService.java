package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.MedicineCategoryReqDTO;
import com.ijse.MediFind.dto.response.MedicineCategoryResDTO;

import java.util.List;

public interface MedicineCategoryService {

    MedicineCategoryResDTO createCategory(MedicineCategoryReqDTO categoryReqDTO);

    MedicineCategoryResDTO getCategoryById(Long id);

    List<MedicineCategoryResDTO> getAllCategories();

    MedicineCategoryResDTO updateCategory(Long id, MedicineCategoryReqDTO categoryReqDTO);

    void deleteCategory(Long id);
}
