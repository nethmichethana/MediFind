package com.ijse.MediFind.controller;

import com.ijse.MediFind.constants.CommonResponse;
import com.ijse.MediFind.dto.request.AiChatReqDTO;
import com.ijse.MediFind.dto.response.AiChatResDTO;
import com.ijse.MediFind.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.ijse.MediFind.constants.ResponseCode.OPERATION_SUCCESS;
import static com.ijse.MediFind.constants.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public CommonResponse chat(@RequestBody AiChatReqDTO reqDTO) {
        AiChatResDTO response = aiChatService.askAi(reqDTO);
        return new CommonResponse(
                OPERATION_SUCCESS,
                response,
                SUCCESS_MESSAGE
        );
    }
}

