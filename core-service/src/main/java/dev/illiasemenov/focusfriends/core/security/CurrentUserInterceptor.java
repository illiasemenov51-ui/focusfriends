package dev.illiasemenov.focusfriends.core.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * Требует заголовок X-User-Id на каждый запрос. В проде этот заголовок ставит
 * gateway после валидации JWT — сам core-service JWT не парсит и доверяет заголовку.
 * Если сервис вызывают напрямую мимо gateway (например, в разработке) — без
 * заголовка запрос будет отклонён с 401.
 */
public class CurrentUserInterceptor implements HandlerInterceptor {

    public static final String USER_ID_HEADER = "X-User-Id";

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                              @NonNull HttpServletResponse response,
                              @NonNull Object handler) throws Exception {

        String header = request.getHeader(USER_ID_HEADER);

        if (header == null || header.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Отсутствует заголовок X-User-Id\"}"
            );
            return false;
        }

        try {
            CurrentUserContext.set(UUID.fromString(header));
        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":400,\"error\":\"Bad Request\",\"message\":\"X-User-Id должен быть валидным UUID\"}"
            );
            return false;
        }

        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request,
                                 @NonNull HttpServletResponse response,
                                 @NonNull Object handler, Exception ex) {
        CurrentUserContext.clear();
    }
}
