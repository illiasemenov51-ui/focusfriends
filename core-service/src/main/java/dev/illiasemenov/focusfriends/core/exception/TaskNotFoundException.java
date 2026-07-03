package dev.illiasemenov.focusfriends.core.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class TaskNotFoundException extends ApiException {

    public TaskNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Задача с id '" + id + "' не найдена");
    }
}
