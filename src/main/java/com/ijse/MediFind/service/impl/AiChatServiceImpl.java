package com.ijse.MediFind.service.impl;

import com.ijse.MediFind.dto.request.AiChatReqDTO;
import com.ijse.MediFind.dto.response.AiChatResDTO;
import com.ijse.MediFind.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatServiceImpl implements AiChatService {

    @Value("${ai.chat.api.key}")
    private String apiKey;

    @Value("${ai.chat.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${ai.chat.model:gpt-3.5-turbo}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public AiChatResDTO askAi(AiChatReqDTO reqDTO) {
        if (reqDTO == null || reqDTO.getMessage() == null || reqDTO.getMessage().trim().isEmpty()) {
            return AiChatResDTO.builder()
                    .reply("Please enter a valid clinical or medical question.")
                    .build();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> payload = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are MediFind Copilot, a helpful AI medical and pharmacy clinical assistant. Give concise, accurate, and helpful answers about medicines, precautions, and general clinical guidance. Always advise users to consult a certified doctor or pharmacist for emergency conditions."),
                            Map.of("role", "user", "content", reqDTO.getMessage().trim())
                    ),
                    "max_tokens", 500
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            Map response = restTemplate.postForObject(apiUrl, requestEntity, Map.class);

            if (response != null && response.containsKey("choices")) {
                List choices = (List) response.get("choices");
                if (!choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map messageMap = (Map) firstChoice.get("message");
                    String content = (String) messageMap.get("content");
                    return AiChatResDTO.builder().reply(content).build();
                }
            }

            return AiChatResDTO.builder()
                    .reply("I received your question but couldn't generate a response. Please try again.")
                    .build();

        } catch (Exception e) {
            log.error("AI Chat API Error: ", e);
            return AiChatResDTO.builder()
                    .reply("Sorry, I am currently unable to reach the AI service. " + (e.getMessage() != null ? e.getMessage() : ""))
                    .build();
        }
    }
}

