package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.NotificationReqDTO;
import com.ijse.MediFind.dto.response.NotificationResDTO;

import java.util.List;

public interface NotificationService {

    NotificationResDTO createNotification(NotificationReqDTO notificationReqDTO);

    NotificationResDTO getNotificationById(Long id);

    List<NotificationResDTO> getAllNotifications();

    NotificationResDTO updateNotification(Long id, NotificationReqDTO notificationReqDTO);

    void deleteNotification(Long id);
}
