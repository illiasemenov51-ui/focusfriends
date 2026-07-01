package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends ApiException {

    public EmailAlreadyExistsException(String email) {
        super(HttpStatus.CONFLICT, "Пользователь с email '" + email + "' уже существует");
    }
}
