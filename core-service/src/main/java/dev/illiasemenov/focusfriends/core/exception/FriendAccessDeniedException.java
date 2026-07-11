package dev.illiasemenov.focusfriends.core.exception;

import org.springframework.http.HttpStatus;

/**
 * Кидается, когда пользователь запрашивает данные другого пользователя
 * (задачи, календарь), не будучи с ним в друзьях. Намеренно 404, а не 403 —
 * чтобы не подтверждать существование пользователя/его данных (см. README,
 * раздел "Владение ресурсами").
 */
public class FriendAccessDeniedException extends ApiException {

    public FriendAccessDeniedException() {
        super(HttpStatus.NOT_FOUND, "Данные пользователя недоступны");
    }
}
