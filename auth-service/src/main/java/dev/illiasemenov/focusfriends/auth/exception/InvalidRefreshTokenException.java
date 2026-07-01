package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class InvalidRefreshTokenException extends ApiException {

    public InvalidRefreshTokenException() {
        super(HttpStatus.UNAUTHORIZED, "Refresh-токен недействителен или истёк");
    }
}
