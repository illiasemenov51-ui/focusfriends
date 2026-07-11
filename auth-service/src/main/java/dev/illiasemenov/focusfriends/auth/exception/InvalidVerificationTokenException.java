package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class InvalidVerificationTokenException extends ApiException {

    public InvalidVerificationTokenException() {
        super(HttpStatus.BAD_REQUEST, "Ссылка подтверждения недействительна или устарела — запросите новую");
    }
}
