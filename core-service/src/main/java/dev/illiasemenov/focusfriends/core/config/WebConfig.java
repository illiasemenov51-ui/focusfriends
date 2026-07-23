package dev.illiasemenov.focusfriends.core.config;

import dev.illiasemenov.focusfriends.core.security.CurrentUserInterceptor;
import dev.illiasemenov.focusfriends.core.security.InternalSecretInterceptor;
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
        // Без исключений путей: защищает и /api/users-facing, и внутренние
        // сервис-сервис эндпоинты одинаково.
        registry.addInterceptor(new InternalSecretInterceptor(internalSharedSecret))
                .addPathPatterns("/api/**")
                .order(0);
        registry.addInterceptor(new CurrentUserInterceptor())
                .addPathPatterns("/api/**")
                .order(1);
    }
}
