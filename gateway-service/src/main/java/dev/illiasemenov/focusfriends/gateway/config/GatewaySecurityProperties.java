package dev.illiasemenov.focusfriends.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record GatewaySecurityProperties(
        Jwt jwt,
        List<String> publicPaths
) {
    public record Jwt(String secret) {
    }
}
