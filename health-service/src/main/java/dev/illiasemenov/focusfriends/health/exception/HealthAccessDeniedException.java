package dev.illiasemenov.focusfriends.health.exception;

import org.springframework.http.HttpStatus;

/**
 * Кидается, когда данные о здоровье другого пользователя недоступны — либо
 * потому что вы не друзья, либо потому что он не включил "делиться с друзьями".
 * Намеренно 404 (не 403) — не подтверждаем ни дружбу, ни настройки приватности.
 */
public class HealthAccessDeniedException extends ApiException {
    public HealthAccessDeniedException() {
        super(HttpStatus.NOT_FOUND, "Данные о здоровье недоступны");
    }
}
