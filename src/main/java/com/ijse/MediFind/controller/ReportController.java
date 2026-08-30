package com.ijse.MediFind.controller;

import com.ijse.MediFind.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
}
