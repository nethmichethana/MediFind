package com.ijse.MediFind.service;

public interface AuditLogService {

    void log(Long userId, String action, String entityName, Long entityId, String description);
}
