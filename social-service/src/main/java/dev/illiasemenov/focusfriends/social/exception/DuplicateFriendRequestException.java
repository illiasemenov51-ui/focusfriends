package dev.illiasemenov.focusfriends.social.exception;

import org.springframework.http.HttpStatus;

public class DuplicateFriendRequestException extends ApiException {

    public DuplicateFriendRequestException() {
        super(HttpStatus.CONFLICT, "Запрос в друзья уже отправлен");
    }
}
