package dev.illiasemenov.focusfriends.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank
        String token,

        @NotBlank
        @Size(min = 8, max = 72, message = "Пароль должен быть от 8 до 72 символов")
        String newPassword
) {
}
