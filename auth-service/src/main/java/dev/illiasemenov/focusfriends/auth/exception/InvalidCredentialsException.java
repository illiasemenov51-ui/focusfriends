package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends ApiException {

    public InvalidCredentialsException() {
        super(HttpStatus.UNAUTHORIZED, "Неверный email или пароль");
    }
}
