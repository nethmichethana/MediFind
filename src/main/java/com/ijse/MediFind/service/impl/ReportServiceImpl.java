package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.repository.MedicineCategoryRepository;
import com.ijse.MediFind.repository.MedicineRepository;
import com.ijse.MediFind.repository.ReservationRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository medicineCategoryRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public Map<String, Object> generateReport() {

        Map<String, Object> report = new LinkedHashMap<>();

        long totalUsers = userRepository.count();

        long totalMedicines = medicineRepository.count();

        long totalCategories = medicineCategoryRepository.count();

        long totalReservations = reservationRepository.count();

        report.put("totalUsers", totalUsers);
        report.put("totalMedicines", totalMedicines);
        report.put("totalCategories", totalCategories);
        report.put("totalReservations", totalReservations);

        return report;
    }
}
