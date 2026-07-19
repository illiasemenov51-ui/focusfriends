package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class InvalidApiTokenException extends ApiException {
    public InvalidApiTokenException() {
        super(HttpStatus.UNAUTHORIZED, "API-токен недействителен или отозван");
    }
}
