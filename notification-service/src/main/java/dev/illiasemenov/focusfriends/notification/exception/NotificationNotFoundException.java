package dev.illiasemenov.focusfriends.notification.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class NotificationNotFoundException extends ApiException {

    public NotificationNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Уведомление с id '" + id + "' не найдено");
    }
}
