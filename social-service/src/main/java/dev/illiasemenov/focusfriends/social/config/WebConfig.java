package dev.illiasemenov.focusfriends.social.config;

import dev.illiasemenov.focusfriends.social.security.CurrentUserInterceptor;
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
                // внутренний эндпоинт начисления очков вызывается напрямую другими
                // сервисами (например, core-service), минуя gateway — там нет X-User-Id
                .excludePathPatterns("/api/leaderboard/points");
    }
}
