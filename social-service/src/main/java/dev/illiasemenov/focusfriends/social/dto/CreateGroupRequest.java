package dev.illiasemenov.focusfriends.social.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(

        @NotBlank
        @Size(max = 255)
        String name
) {
}
