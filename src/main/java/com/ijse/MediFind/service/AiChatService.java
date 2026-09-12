package com.ijse.MediFind.service;

import com.ijse.MediFind.dto.request.AiChatReqDTO;
import com.ijse.MediFind.dto.response.AiChatResDTO;

public interface AiChatService {
    AiChatResDTO askAi(AiChatReqDTO reqDTO);
}

