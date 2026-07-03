package dev.illiasemenov.focusfriends.core.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class HabitNotFoundException extends ApiException {

    public HabitNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "Привычка с id '" + id + "' не найдена");
    }
}
