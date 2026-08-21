package com.ijse.MediFind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonResponse {
    private int status;
    private String message;

    public CommonResponse(int operationSuccess, NotificationResDTO notification, String successMessage) {
        this.status = operationSuccess;
        this.message = successMessage;

    }
}
