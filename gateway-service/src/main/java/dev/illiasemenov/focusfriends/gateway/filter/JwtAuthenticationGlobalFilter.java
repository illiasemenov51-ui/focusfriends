package dev.illiasemenov.focusfriends.gateway.filter;

import dev.illiasemenov.focusfriends.gateway.config.GatewaySecurityProperties;
import dev.illiasemenov.focusfriends.gateway.security.ApiTokenValidator;
import dev.illiasemenov.focusfriends.gateway.security.JwtValidator;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Проверяет Bearer-токен на входе в gateway — это либо обычный JWT (веб-сессия,
 * проверяется локально по подписи), либо персональный API-токен вида ff_pat_...
 * (внешние автоматизации вроде iOS Shortcuts — проверяется сетевым вызовом в
 * auth-service, т.к. его валидность/отзыв живут в БД, а не в подписи).
 * Публичные пути (регистрация/логин/refresh, а также GET /api/users/{id} для
 * публичного профиля) пропускаются без токена. При успехе прокидывает вниз
 * заголовок X-User-Id, которому доверяют downstream-сервисы.
 */
@Component
public class JwtAuthenticationGlobalFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Pattern PUBLIC_USER_PROFILE = Pattern.compile("^/api/users/(?!me$)[^/]+$");
    private static final List<String> FRONTEND_PUBLIC_PATHS = List.of(
            "/",
            "/index.html",
            "/assets",
            "/favicon.ico",
            "/manifest.json",
            "/robots.txt"
    );

    private final JwtValidator jwtValidator;
    private final ApiTokenValidator apiTokenValidator;
    private final List<String> publicPaths;

    public JwtAuthenticationGlobalFilter(JwtValidator jwtValidator,
                                          ApiTokenValidator apiTokenValidator,
                                          GatewaySecurityProperties properties) {
        this.jwtValidator = jwtValidator;
        this.apiTokenValidator = apiTokenValidator;
        this.publicPaths = properties.publicPaths();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Preflight-запросы браузера (CORS) не несут Authorization — пропускаем без проверки,
        // иначе браузер получит 401 на OPTIONS ещё до реального запроса.
        if (request.getMethod() != null && "OPTIONS".equals(request.getMethod().name())) {
            return chain.filter(exchange);
        }

        if (isPublic(path, request.getMethod().name())) {
            return chain.filter(exchange);
        }
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return unauthorized(exchange, "Отсутствует Authorization заголовок");
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        if (apiTokenValidator.looksLikeApiToken(token)) {
            return apiTokenValidator.validateAndExtractUserId(token)
                    .flatMap(userId -> proceedWithUserId(exchange, chain, userId))
                    .switchIfEmpty(Mono.defer(() -> unauthorized(exchange, "Недействительный API-токен")));
        }

        Optional<String> userIdOpt = jwtValidator.validateAndExtractUserId(token);
        if (userIdOpt.isEmpty()) {
            return unauthorized(exchange, "Недействительный или истёкший токен");
        }

        return proceedWithUserId(exchange, chain, userIdOpt.get());
    }

    private Mono<Void> proceedWithUserId(ServerWebExchange exchange, GatewayFilterChain chain, String userId) {
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublic(String path, String method) {
        if (publicPaths.contains(path)) {
            return true;
        }
        if (FRONTEND_PUBLIC_PATHS.contains(path) || path.startsWith("/assets/")) {
            return true;
        }
        // публичный просмотр профиля: GET /api/users/{id}, но не /api/users/me
        return "GET".equals(method) && PUBLIC_USER_PROFILE.matcher(path).matches();
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\"}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
