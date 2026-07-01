package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class UserNotFoundException extends ApiException {

    public UserNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Пользователь с id '" + id + "' не найден");
    }
}
