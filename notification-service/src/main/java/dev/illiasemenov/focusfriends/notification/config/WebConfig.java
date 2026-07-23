package dev.illiasemenov.focusfriends.notification.config;

import dev.illiasemenov.focusfriends.notification.security.CurrentUserInterceptor;
import dev.illiasemenov.focusfriends.notification.security.InternalSecretInterceptor;
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
        // Секрет требуется ВЕЗДЕ, включая /api/notifications/send: без него это был
        // бы открытый релей для отправки произвольных писем/уведомлений кому угодно.
        registry.addInterceptor(new InternalSecretInterceptor(internalSharedSecret))
                .addPathPatterns("/api/**")
                .order(0);
        registry.addInterceptor(new CurrentUserInterceptor())
                .addPathPatterns("/api/**")
                // отправка уведомления — внутренний вызов от других сервисов
                // (адресат передаётся в теле запроса, не через X-User-Id)
                .excludePathPatterns("/api/notifications/send")
                .order(1);
    }
}
