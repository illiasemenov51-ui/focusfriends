package dev.illiasemenov.focusfriends.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8, max = 72, message = "Пароль должен быть от 8 до 72 символов")
        String password,

        @NotBlank
        @Size(min = 2, max = 100)
        String name
) {
}
