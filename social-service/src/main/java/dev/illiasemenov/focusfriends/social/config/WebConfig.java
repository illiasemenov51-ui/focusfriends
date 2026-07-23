package dev.illiasemenov.focusfriends.social.config;

import dev.illiasemenov.focusfriends.social.security.CurrentUserInterceptor;
import dev.illiasemenov.focusfriends.social.security.InternalSecretInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String internalSharedSecret;

    public WebConfig(@Value("${internal.shared-secret}") String internalSharedSecret) {
        this.internalSharedSecret = internalSharedSecret;
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        // Секрет требуется ВЕЗДЕ, включая /api/leaderboard/points: этот эндпоинт
        // не имеет пользовательского X-User-Id (вызывается сервис-сервис), но
        // без общего секрета он был бы открыт для начисления произвольных очков
        // любому userId кем угодно, кто достучится до сервиса напрямую.
        registry.addInterceptor(new InternalSecretInterceptor(internalSharedSecret))
                .addPathPatterns("/api/**")
                .order(0);
        registry.addInterceptor(new CurrentUserInterceptor())
                .addPathPatterns("/api/**")
                // внутренний эндпоинт начисления очков вызывается напрямую другими
                // сервисами (например, core-service), минуя gateway — там нет X-User-Id
                .excludePathPatterns("/api/leaderboard/points")
                .order(1);
    }
}
