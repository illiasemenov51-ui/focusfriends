package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class ApiTokenNotFoundException extends ApiException {
    public ApiTokenNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Токен с id '" + id + "' не найден");
    }
}
