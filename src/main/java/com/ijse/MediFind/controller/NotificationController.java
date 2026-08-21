package com.ijse.MediFind.controller;


import com.ijse.MediFind.dto.request.NotificationReqDTO;
import com.ijse.MediFind.dto.response.CommonResponse;
import com.ijse.MediFind.dto.response.NotificationResDTO;
import com.ijse.MediFind.entity.Notification;
import com.ijse.MediFind.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/notifications")
    public CommonResponse createNotification(@RequestBody NotificationReqDTO notificationReqDTO) {

        NotificationResDTO notification =  notificationService.createNotification( notificationReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                notification,
                SUCCESS_MESSAGE
        );
    }

    @GetMapping("/notifications/{id}")
    public CommonResponse getNotificationById(@PathVariable Long id) {

        NotificationResDTO notification = notificationService.getNotificationById(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                notification,
                SUCCESS_MESSAGE
        );

    }

    @GetMapping("/notifications")
    public CommonResponse getAllNotifications() {

        List<NotificationResDTO> notificationList = notificationService.getAllNotifications();

        return new CommonResponse(
                OPERATION_SUCCESS,
                (NotificationResDTO) notificationList,
                SUCCESS_MESSAGE
        );
    }

    @PutMapping("/notifications/{id}")
    public CommonResponse updateNotification(@PathVariable Long id, @RequestBody NotificationReqDTO notificationReqDTO) {

        NotificationResDTO notification = notificationService.updateNotification(id, notificationReqDTO);

        return new CommonResponse(
                OPERATION_SUCCESS,
                notification,
                SUCCESS_MESSAGE
        );
    }
    @DeleteMapping("/notifications/{id}")
    public CommonResponse deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);

        return new CommonResponse(
                OPERATION_SUCCESS,
                SUCCESS_MESSAGE
        );
    }
}
