package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.entity.AuditLog;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.AuditLogRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl  implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void log(Long userId, String action, String entityName, Long entityId, String description) {


        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);

    }
}
