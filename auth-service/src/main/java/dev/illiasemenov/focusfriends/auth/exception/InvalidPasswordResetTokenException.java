package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class InvalidPasswordResetTokenException extends ApiException {

    public InvalidPasswordResetTokenException() {
        super(HttpStatus.BAD_REQUEST, "Ссылка сброса пароля недействительна или устарела — запросите новую");
    }
}
