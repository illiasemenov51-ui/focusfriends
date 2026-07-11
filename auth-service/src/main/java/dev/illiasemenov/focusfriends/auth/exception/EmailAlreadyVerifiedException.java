package dev.illiasemenov.focusfriends.auth.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyVerifiedException extends ApiException {

    public EmailAlreadyVerifiedException() {
        super(HttpStatus.CONFLICT, "Email уже подтверждён");
    }
}
