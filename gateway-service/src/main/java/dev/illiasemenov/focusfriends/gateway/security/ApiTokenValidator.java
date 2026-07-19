package dev.illiasemenov.focusfriends.gateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Проверка персональных API-токенов (ff_pat_...) — используются внешними
 * автоматизациями (iOS Shortcuts), которые не проходят обычный логин-flow.
 * В отличие от JWT, это долгоживущий токен, чья валидность живёт в БД
 * auth-service — поэтому, в отличие от JwtValidator, тут нужен сетевой вызов.
 */
@Component
public class ApiTokenValidator {

    public static final String API_TOKEN_PREFIX = "ff_pat_";

    private final WebClient webClient;

    public ApiTokenValidator(WebClient.Builder webClientBuilder,
                              @Value("${app.auth-service.url:http://localhost:8081}") String authServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(authServiceUrl).build();
    }

    public boolean looksLikeApiToken(String token) {
        return token.startsWith(API_TOKEN_PREFIX);
    }

    private record ValidateResponse(String userId) {
    }

    /** Пусто, если токен недействителен/отозван или auth-service недоступен. */
    public Mono<String> validateAndExtractUserId(String token) {
        return webClient.get()
                .uri("/api/auth/api-tokens/validate")
                .header("X-Api-Token", token)
                .retrieve()
                .bodyToMono(ValidateResponse.class)
                .map(ValidateResponse::userId)
                .onErrorResume(e -> Mono.empty());
    }
}
