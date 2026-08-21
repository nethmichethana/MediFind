package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.NotificationReqDTO;
import com.ijse.MediFind.dto.response.NotificationResDTO;
import com.ijse.MediFind.entity.Notification;
import com.ijse.MediFind.entity.User;
import com.ijse.MediFind.exception.ResourceNotFoundException;
import com.ijse.MediFind.repository.NotificationRepository;
import com.ijse.MediFind.repository.UserRepository;
import com.ijse.MediFind.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public NotificationResDTO createNotification(NotificationReqDTO notificationReqDTO) {
        User user = userRepository.findById(notificationReqDTO.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + notificationReqDTO.getUserId()
                        )
                );

        Notification notification = Notification.builder()
                .title(notificationReqDTO.getTitle())
                .message(notificationReqDTO.getMessage())
                .read(notificationReqDTO.getRead() != null
                        ? notificationReqDTO.getRead()
                        : false)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return NotificationResDTO.builder()
                .id(savedNotification.getId())
                .title(savedNotification.getTitle())
                .message(savedNotification.getMessage())
                .read(savedNotification.getRead())
                .createdAt(savedNotification.getCreatedAt())
                .userId(savedNotification.getUser().getId())
                .build();
    }

    @Override
    public NotificationResDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: " + id
                                )
                        );

        return NotificationResDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .userId(notification.getUser().getId())
                .build();
    }

    @Override
    public List<NotificationResDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(notification -> NotificationResDTO.builder()
                        .id(notification.getId())
                        .title(notification.getTitle())
                        .message(notification.getMessage())
                        .read(notification.getRead())
                        .createdAt(notification.getCreatedAt())
                        .userId(notification.getUser().getId())
                        .build()
                )
                .toList();
    }

    @Override
    public NotificationResDTO updateNotification(Long id, NotificationReqDTO notificationReqDTO) {
        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: " + id
                                )
                        );

        User user = userRepository
                .findById(notificationReqDTO.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + notificationReqDTO.getUserId()
                        )
                );

        notification.setTitle(
                notificationReqDTO.getTitle()
        );

        notification.setMessage(
                notificationReqDTO.getMessage()
        );

        notification.setRead(
                notificationReqDTO.getRead()
        );

        notification.setUser(user);

        Notification updatedNotification =
                notificationRepository.save(notification);

        return NotificationResDTO.builder()
                .id(updatedNotification.getId())
                .title(updatedNotification.getTitle())
                .message(updatedNotification.getMessage())
                .read(updatedNotification.getRead())
                .createdAt(updatedNotification.getCreatedAt())
                .userId(updatedNotification.getUser().getId())
                .build();
    }

    @Override
    public void deleteNotification(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found with id: " + id
                                )
                        );

        notificationRepository.delete(notification);

    }
}
