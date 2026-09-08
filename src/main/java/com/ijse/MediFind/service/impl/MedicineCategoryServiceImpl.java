package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.MedicineCategoryReqDTO;
import com.ijse.MediFind.dto.response.MedicineCategoryResDTO;
import com.ijse.MediFind.entity.MedicineCategory;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.MedicineCategoryRepository;
import com.ijse.MediFind.service.MedicineCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@Slf4j
@RequiredArgsConstructor
public class MedicineCategoryServiceImpl implements MedicineCategoryService {

    private final MedicineCategoryRepository medicineCategoryRepository;

    @Override
    public MedicineCategoryResDTO createCategory(MedicineCategoryReqDTO categoryReqDTO) {
        MedicineCategory medicineCategory = MedicineCategory.builder()
                .name(categoryReqDTO.getName())
                .description(categoryReqDTO.getDescription())
                .build();

        MedicineCategory savedCategory =
                medicineCategoryRepository.save(medicineCategory);

        return MedicineCategoryResDTO.builder()
                .id(savedCategory.getId())
                .name(savedCategory.getName())
                .description(savedCategory.getDescription())
                .build();
    }

    @Override
    public MedicineCategoryResDTO getCategoryById(Long id) {
        MedicineCategory medicineCategory =
                medicineCategoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine category not found with id: " + id
                                 )
                        );

        return MedicineCategoryResDTO.builder()
                .id(medicineCategory.getId())
                .name(medicineCategory.getName())
                .description(medicineCategory.getDescription())
                .build();
    }

    @Override
    public List<MedicineCategoryResDTO> getAllCategories() {
        return medicineCategoryRepository.findAll()
                .stream()
                .map(category -> MedicineCategoryResDTO.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .description(category.getDescription())
                        .build())
                .toList();
    }

    @Override
    public MedicineCategoryResDTO updateCategory(Long id, MedicineCategoryReqDTO categoryReqDTO) {
        MedicineCategory medicineCategory =
                medicineCategoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine category not found with id: " + id
                                )
                        );

        medicineCategory.setName(categoryReqDTO.getName());
        medicineCategory.setDescription(categoryReqDTO.getDescription());

        MedicineCategory updatedCategory =
                medicineCategoryRepository.save(medicineCategory);

        return MedicineCategoryResDTO.builder()
                .id(updatedCategory.getId())
                .name(updatedCategory.getName())
                .description(updatedCategory.getDescription())
                .build();
    }

    @Override
    public void deleteCategory(Long id) {
        MedicineCategory medicineCategory =
                medicineCategoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicine category not found with id: " + id
                                )
                        );

        medicineCategoryRepository.delete(medicineCategory);
    }
}
