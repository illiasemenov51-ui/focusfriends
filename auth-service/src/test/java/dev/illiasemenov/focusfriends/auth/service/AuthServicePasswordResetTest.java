package dev.illiasemenov.focusfriends.auth.service;

import dev.illiasemenov.focusfriends.auth.client.NotificationServiceClient;
import dev.illiasemenov.focusfriends.auth.config.JwtProperties;
import dev.illiasemenov.focusfriends.auth.entity.PasswordResetToken;
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
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthServicePasswordResetTest {

    @Test
    void requestPasswordResetCreatesTokenAndSendsEmail() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("test@example.com")
                .passwordHash("hash")
                .name("Test")
                .emailVerified(true)
                .build();

        AtomicReference<PasswordResetToken> savedToken = new AtomicReference<>();
        AtomicBoolean emailSent = new AtomicBoolean(false);

        UserRepository userRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByEmail" -> Optional.of(user);
                    case "save" -> args[0];
                    default -> defaultValue(method.getReturnType());
                }
        );

        PasswordResetTokenRepository passwordResetTokenRepository = (PasswordResetTokenRepository) Proxy.newProxyInstance(
                PasswordResetTokenRepository.class.getClassLoader(),
                new Class<?>[]{PasswordResetTokenRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "deleteAllByUserId" -> null;
                    case "save" -> {
                        savedToken.set((PasswordResetToken) args[0]);
                        yield args[0];
                    }
                    default -> defaultValue(method.getReturnType());
                }
        );

        AuthService authService = new AuthService(
                userRepository,
                (RefreshTokenRepository) Proxy.newProxyInstance(
                        RefreshTokenRepository.class.getClassLoader(),
                        new Class<?>[]{RefreshTokenRepository.class},
                        (proxy, method, args) -> defaultValue(method.getReturnType())
                ),
                (EmailVerificationTokenRepository) Proxy.newProxyInstance(
                        EmailVerificationTokenRepository.class.getClassLoader(),
                        new Class<?>[]{EmailVerificationTokenRepository.class},
                        (proxy, method, args) -> defaultValue(method.getReturnType())
                ),
                passwordResetTokenRepository,
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
                new NotificationServiceClient("http://localhost:8084") {
                    @Override
                    public void sendVerificationEmail(UUID userId, String recipientEmail, String verificationLink) {
                    }

                    @Override
                    public void sendPasswordResetEmail(UUID userId, String recipientEmail, String resetLink) {
                        emailSent.set(true);
                    }
                },
                "http://localhost:5173"
        );

        authService.requestPasswordReset(user.getEmail());

        assertTrue(emailSent.get());
        assertNotNull(savedToken.get());
        assertEquals(userId, savedToken.get().getUserId());
        assertTrue(savedToken.get().getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void resetPasswordUpdatesUserAndRevokesRefreshTokens() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("test@example.com")
                .passwordHash("old-password")
                .name("Test")
                .emailVerified(true)
                .build();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(userId)
                .token("token-123")
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        AtomicBoolean refreshTokensRevoked = new AtomicBoolean(false);

        UserRepository userRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.of(user);
                    case "save" -> args[0];
                    default -> defaultValue(method.getReturnType());
                }
        );

        PasswordResetTokenRepository passwordResetTokenRepository = (PasswordResetTokenRepository) Proxy.newProxyInstance(
                PasswordResetTokenRepository.class.getClassLoader(),
                new Class<?>[]{PasswordResetTokenRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByToken" -> Optional.of(resetToken);
                    case "deleteAllByUserId" -> null;
                    case "delete" -> null;
                    default -> defaultValue(method.getReturnType());
                }
        );

        AuthService authService = new AuthService(
                userRepository,
                (RefreshTokenRepository) Proxy.newProxyInstance(
                        RefreshTokenRepository.class.getClassLoader(),
                        new Class<?>[]{RefreshTokenRepository.class},
                        (proxy, method, args) -> switch (method.getName()) {
                            case "revokeAllByUserId" -> {
                                refreshTokensRevoked.set(true);
                                yield null;
                            }
                            default -> defaultValue(method.getReturnType());
                        }
                ),
                (EmailVerificationTokenRepository) Proxy.newProxyInstance(
                        EmailVerificationTokenRepository.class.getClassLoader(),
                        new Class<?>[]{EmailVerificationTokenRepository.class},
                        (proxy, method, args) -> defaultValue(method.getReturnType())
                ),
                passwordResetTokenRepository,
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
                new NotificationServiceClient("http://localhost:8084") {
                    @Override
                    public void sendVerificationEmail(UUID userId, String recipientEmail, String verificationLink) {
                    }

                    @Override
                    public void sendPasswordResetEmail(UUID userId, String recipientEmail, String resetLink) {
                    }
                },
                "http://localhost:5173"
        );

        authService.resetPassword("token-123", "new-password");

        assertEquals("new-password", user.getPasswordHash());
        assertTrue(refreshTokensRevoked.get());
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
