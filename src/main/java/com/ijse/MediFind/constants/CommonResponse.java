package com.ijse.MediFind.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommonResponse {
    private int status;
    private Object body;
    private String message;

    public CommonResponse(int status, String message) {
        this.status = status;
        this.message = message;
    }
}
