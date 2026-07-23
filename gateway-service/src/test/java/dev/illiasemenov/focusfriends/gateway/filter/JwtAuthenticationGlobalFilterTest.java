package dev.illiasemenov.focusfriends.gateway.filter;

import dev.illiasemenov.focusfriends.gateway.config.GatewaySecurityProperties;
import dev.illiasemenov.focusfriends.gateway.security.ApiTokenValidator;
import dev.illiasemenov.focusfriends.gateway.security.JwtValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Регрессионные тесты на фикс двух уязвимостей:
 *  1) подмена личности через собственный заголовок X-User-Id в запросе клиента;
 *  2) доступ к "только сервис-сервис" эндпоинтам (/api/leaderboard/points,
 *     /api/notifications/send) через gateway с обычным пользовательским JWT.
 */
class JwtAuthenticationGlobalFilterTest {

    private static final String REAL_USER_ID = "11111111-1111-1111-1111-111111111111";
    private static final String SPOOFED_USER_ID = "99999999-9999-9999-9999-999999999999";
    private static final String SHARED_SECRET = "test-shared-secret";

    private JwtValidator jwtValidator;
    private ApiTokenValidator apiTokenValidator;
    private JwtAuthenticationGlobalFilter filter;

    @BeforeEach
    void setUp() {
        jwtValidator = mock(JwtValidator.class);
        apiTokenValidator = mock(ApiTokenValidator.class);

        GatewaySecurityProperties properties = new GatewaySecurityProperties(
                new GatewaySecurityProperties.Jwt("unused-in-this-test"),
                List.of("/api/auth/register", "/api/auth/login", "/api/auth/refresh"),
                new GatewaySecurityProperties.Internal(
                        SHARED_SECRET,
                        List.of("/api/leaderboard/points", "/api/notifications/send")
                )
        );

        filter = new JwtAuthenticationGlobalFilter(jwtValidator, apiTokenValidator, properties);
    }

    @Test
    void stripsClientSuppliedUserIdHeaderAndSetsRealOne() {
        when(jwtValidator.validateAndExtractUserId("good-token")).thenReturn(Optional.of(REAL_USER_ID));

        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/tasks")
                .header("Authorization", "Bearer good-token")
                // атакующий пытается выдать себя за другого пользователя
                .header("X-User-Id", SPOOFED_USER_ID)
                .header("X-Internal-Secret", "attacker-guess")
                .build();
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = capturingChain();
        filter.filter(exchange, chain).block();

        ServerWebExchange forwarded = lastCapturedExchange;
        assertThat(forwarded.getRequest().getHeaders().getFirst("X-User-Id")).isEqualTo(REAL_USER_ID);
        assertThat(forwarded.getRequest().getHeaders().getFirst("X-Internal-Secret")).isEqualTo(SHARED_SECRET);
    }

    @Test
    void rejectsRequestWithInvalidToken() {
        when(jwtValidator.validateAndExtractUserId("bad-token")).thenReturn(Optional.empty());

        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/tasks")
                .header("Authorization", "Bearer bad-token")
                .build();
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = capturingChain();
        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(lastCapturedExchange).isNull();
    }

    @Test
    void blocksServiceOnlyLeaderboardPointsEndpointEvenWithValidJwt() {
        when(jwtValidator.validateAndExtractUserId("good-token")).thenReturn(Optional.of(REAL_USER_ID));

        MockServerHttpRequest request = MockServerHttpRequest
                .post("/api/leaderboard/points")
                .header("Authorization", "Bearer good-token")
                .build();
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = capturingChain();
        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(lastCapturedExchange).isNull();
        verifyNoInteractions(jwtValidator);
    }

    @Test
    void blocksServiceOnlyNotificationsSendEndpointEvenWithValidJwt() {
        MockServerHttpRequest request = MockServerHttpRequest
                .post("/api/notifications/send")
                .header("Authorization", "Bearer good-token")
                .build();
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = capturingChain();
        filter.filter(exchange, chain).block();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(lastCapturedExchange).isNull();
    }

    @Test
    void allowsPublicRegisterEndpointWithoutToken() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/auth/register").build();
        ServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = capturingChain();
        filter.filter(exchange, chain).block();

        assertThat(lastCapturedExchange).isNotNull();
    }

    private ServerWebExchange lastCapturedExchange;

    private GatewayFilterChain capturingChain() {
        lastCapturedExchange = null;
        GatewayFilterChain chain = Mockito.mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenAnswer(invocation -> {
            lastCapturedExchange = invocation.getArgument(0);
            return Mono.empty();
        });
        return chain;
    }
}
