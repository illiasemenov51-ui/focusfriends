package dev.illiasemenov.focusfriends.social.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class GroupNotFoundException extends ApiException {

    public GroupNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Группа с id '" + id + "' не найдена");
    }
}
