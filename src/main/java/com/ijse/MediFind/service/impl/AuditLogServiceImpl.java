package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.repository.AuditLogRepository;
import com.ijse.MediFind.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl  implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(Long userId, String action, String entityName, Long entityId, String description) {

    }
}
