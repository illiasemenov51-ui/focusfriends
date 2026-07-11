package dev.illiasemenov.focusfriends.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        boolean mailEnabled,
        String mailFrom,
        String mailTo
) {
}
