package dev.illiasemenov.focusfriends.notification.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Требует общий секрет (заголовок X-Internal-Secret) на каждый запрос к /api/**.
 * Этот секрет знают только gateway и внутренние сервисы, вызывающие друг друга
 * напрямую по docker-сети — он подтверждает, что запрос действительно прошёл
 * проверку JWT на gateway (или является легитимным сервис-сервис вызовом),
 * а не был отправлен напрямую в обход gateway с произвольным X-User-Id.
 *
 * Регистрируется БЕЗ исключений путей (в отличие от CurrentUserInterceptor) —
 * он должен защищать в том числе внутренние эндпоинты вроде начисления очков
 * или отправки уведомлений, у которых нет пользовательского X-User-Id вовсе.
 */
public class InternalSecretInterceptor implements HandlerInterceptor {

    public static final String INTERNAL_SECRET_HEADER = "X-Internal-Secret";

    private final byte[] expectedSecret;

    public InternalSecretInterceptor(String expectedSecret) {
        this.expectedSecret = expectedSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                              @NonNull HttpServletResponse response,
                              @Nullable Object handler) throws Exception {

        String provided = request.getHeader(INTERNAL_SECRET_HEADER);

        if (provided == null || !constantTimeEquals(provided.getBytes(StandardCharsets.UTF_8), expectedSecret)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Прямой доступ к сервису запрещён, используйте gateway\"}"
            );
            return false;
        }

        return true;
    }

    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        return MessageDigest.isEqual(a, b);
    }
}
