package dev.illiasemenov.focusfriends.social.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class FriendshipNotFoundException extends ApiException {

    public FriendshipNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Запрос в друзья с id '" + id + "' не найден");
    }
}
