package dev.illiasemenov.focusfriends.notification.config;

import dev.illiasemenov.focusfriends.notification.security.CurrentUserInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(new CurrentUserInterceptor())
                .addPathPatterns("/api/**")
                // отправка уведомления — внутренний вызов от других сервисов
                // (адресат передаётся в теле запроса, не через X-User-Id)
                .excludePathPatterns("/api/notifications/send");
    }
}
