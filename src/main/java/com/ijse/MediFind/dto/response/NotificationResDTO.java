package com.ijse.MediFind.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationResDTO {

    private Long id;

    private String title;

    private String message;

    private Boolean read;

    private LocalDateTime createdAt;

    private Long userId;

}
