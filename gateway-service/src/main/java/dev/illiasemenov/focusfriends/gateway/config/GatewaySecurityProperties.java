package dev.illiasemenov.focusfriends.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record GatewaySecurityProperties(
        Jwt jwt,
        List<String> publicPaths,
        Internal internal
) {
    public record Jwt(String secret) {
    }

    /**
     * Секрет, которым gateway помечает уже проверенные запросы для downstream-сервисов
     * (заголовок X-Internal-Secret), и список путей, которые предназначены ТОЛЬКО для
     * прямых вызовов сервис-сервис (минуя gateway) и поэтому не должны быть достижимы
     * снаружи вообще — даже с валидным пользовательским JWT.
     */
    public record Internal(String sharedSecret, List<String> serviceOnlyPaths) {
    }
}
