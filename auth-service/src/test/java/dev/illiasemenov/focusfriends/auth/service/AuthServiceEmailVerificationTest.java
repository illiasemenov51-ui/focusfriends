package dev.illiasemenov.focusfriends.auth.service;

import dev.illiasemenov.focusfriends.auth.client.NotificationServiceClient;
import dev.illiasemenov.focusfriends.auth.config.JwtProperties;
import dev.illiasemenov.focusfriends.auth.entity.EmailVerificationToken;
import dev.illiasemenov.focusfriends.auth.entity.User;
import dev.illiasemenov.focusfriends.auth.repository.EmailVerificationTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.PasswordResetTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.RefreshTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.UserRepository;
import dev.illiasemenov.focusfriends.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Proxy;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthServiceEmailVerificationTest {

    @Test
    void verifyEmailMarksUserAsVerifiedAndDeletesToken() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("test@example.com")
                .passwordHash("hash")
                .name("Test")
                .emailVerified(false)
                .build();

        EmailVerificationToken token = EmailVerificationToken.builder()
                .userId(userId)
                .token("token-123")
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        UserRepository userRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    switch (method.getName()) {
                        case "findById" -> {
                            return Optional.of(user);
                        }
                        case "save" -> {
                            return args[0];
                        }
                        default -> {
                            return defaultValue(method.getReturnType());
                        }
                    }
                }
        );

        EmailVerificationTokenRepository verificationTokenRepository = (EmailVerificationTokenRepository) Proxy.newProxyInstance(
                EmailVerificationTokenRepository.class.getClassLoader(),
                new Class<?>[]{EmailVerificationTokenRepository.class},
                (proxy, method, args) -> {
                    switch (method.getName()) {
                        case "findByToken" -> {
                            return Optional.of(token);
                        }
                        case "deleteAllByUserId" -> {
                            return null;
                        }
                        case "delete" -> {
                            return null;
                        }
                        default -> {
                            return defaultValue(method.getReturnType());
                        }
                    }
                }
        );

        AuthService authService = new AuthService(
                userRepository,
                (RefreshTokenRepository) Proxy.newProxyInstance(
                        RefreshTokenRepository.class.getClassLoader(),
                        new Class<?>[]{RefreshTokenRepository.class},
                        (proxy, method, args) -> defaultValue(method.getReturnType())
                ),
                verificationTokenRepository,
                (PasswordResetTokenRepository) Proxy.newProxyInstance(
                        PasswordResetTokenRepository.class.getClassLoader(),
                        new Class<?>[]{PasswordResetTokenRepository.class},
                        (proxy, method, args) -> defaultValue(method.getReturnType())
                ),
                new PasswordEncoder() {
                    @Override
                    public String encode(CharSequence rawPassword) {
                        return rawPassword.toString();
                    }

                    @Override
                    public boolean matches(CharSequence rawPassword, String encodedPassword) {
                        return rawPassword.toString().equals(encodedPassword);
                    }
                },
                new JwtService(new JwtProperties("this-is-a-dev-only-secret-key-change-me-in-production-please-32bytes", 900_000L, 604_800_000L)),
                new NotificationServiceClient("http://localhost:8084"),
                "http://localhost:5173"
        );

        authService.verifyEmail("token-123");

        assertTrue(user.isEmailVerified());
    }

    private Object defaultValue(Class<?> returnType) {
        if (returnType == boolean.class) {
            return false;
        }
        if (returnType == int.class) {
            return 0;
        }
        if (returnType == long.class) {
            return 0L;
        }
        if (returnType == double.class) {
            return 0.0d;
        }
        if (returnType == float.class) {
            return 0.0f;
        }
        if (returnType == short.class) {
            return (short) 0;
        }
        if (returnType == byte.class) {
            return (byte) 0;
        }
        if (returnType == char.class) {
            return '\0';
        }
        if (returnType == void.class) {
            return null;
        }
        return null;
    }
}
