package dev.illiasemenov.focusfriends.auth.service;

import dev.illiasemenov.focusfriends.auth.client.NotificationServiceClient;
import dev.illiasemenov.focusfriends.auth.dto.AuthResponse;
import dev.illiasemenov.focusfriends.auth.dto.LoginRequest;
import dev.illiasemenov.focusfriends.auth.dto.ResetPasswordRequest;
import dev.illiasemenov.focusfriends.auth.dto.RegisterRequest;
import dev.illiasemenov.focusfriends.auth.dto.RequestPasswordResetRequest;
import dev.illiasemenov.focusfriends.auth.entity.EmailVerificationToken;
import dev.illiasemenov.focusfriends.auth.entity.RefreshToken;
import dev.illiasemenov.focusfriends.auth.entity.PasswordResetToken;
import dev.illiasemenov.focusfriends.auth.entity.Role;
import dev.illiasemenov.focusfriends.auth.entity.User;
import dev.illiasemenov.focusfriends.auth.exception.EmailAlreadyExistsException;
import dev.illiasemenov.focusfriends.auth.exception.EmailAlreadyVerifiedException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidCredentialsException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidPasswordResetTokenException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidRefreshTokenException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidVerificationTokenException;
import dev.illiasemenov.focusfriends.auth.exception.UserNotFoundException;
import dev.illiasemenov.focusfriends.auth.repository.PasswordResetTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.EmailVerificationTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.RefreshTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.UserRepository;
import dev.illiasemenov.focusfriends.auth.security.JwtService;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationServiceClient notificationServiceClient;
    private final String frontendUrl;

    public AuthService(UserRepository userRepository,
                        RefreshTokenRepository refreshTokenRepository,
                        EmailVerificationTokenRepository verificationTokenRepository,
                        PasswordResetTokenRepository passwordResetTokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        NotificationServiceClient notificationServiceClient,
                        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.notificationServiceClient = notificationServiceClient;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .role(Role.USER)
                .build();

        userRepository.save(user);
        issueVerificationEmail(user);
        log.info("New user registered id={}, email={}", user.getId(), user.getEmail());

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        log.info("User logged in id={}, email={}", user.getId(), user.getEmail());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (storedToken.isRevoked() || storedToken.getExpiryDate().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException();
        }

        var claimsOpt = jwtService.parseClaims(refreshTokenValue);
        if (claimsOpt.isEmpty()) {
            throw new InvalidRefreshTokenException();
        }
        Claims claims = claimsOpt.get();
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new InvalidRefreshTokenException();
        }

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(InvalidRefreshTokenException::new);

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return issueTokens(user);
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(InvalidVerificationTokenException::new);

        if (verificationToken.isExpired()) {
            verificationTokenRepository.delete(verificationToken);
            throw new InvalidVerificationTokenException();
        }

        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(InvalidVerificationTokenException::new);

        user.setEmailVerified(true);
        userRepository.save(user);
        verificationTokenRepository.deleteAllByUserId(user.getId());
        log.info("Email verified for userId={}", user.getId());
    }

    @Transactional
    public void resendVerification(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (user.isEmailVerified()) {
            throw new EmailAlreadyVerifiedException();
        }

        issueVerificationEmail(user);
        log.info("Verification email resent for userId={}", userId);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            issuePasswordResetEmail(user);
            log.info("Password reset requested for userId={}, email={}", user.getId(), user.getEmail());
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(InvalidPasswordResetTokenException::new);

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new InvalidPasswordResetTokenException();
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(InvalidPasswordResetTokenException::new);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.deleteAllByUserId(user.getId());
        refreshTokenRepository.revokeAllByUserId(user.getId());
        log.info("Password reset completed for userId={}", user.getId());
    }

    private void issueVerificationEmail(User user) {
        verificationTokenRepository.deleteAllByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(Instant.now().plusSeconds(24 * 60 * 60))
                .build();
        verificationTokenRepository.save(verificationToken);

        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        notificationServiceClient.sendVerificationEmail(user.getId(), user.getEmail(), verificationLink);
    }

    private void issuePasswordResetEmail(User user) {
        passwordResetTokenRepository.deleteAllByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(Instant.now().plusSeconds(24 * 60 * 60))
                .build();
        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        notificationServiceClient.sendPasswordResetEmail(user.getId(), user.getEmail(), resetLink);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshTokenValue = jwtService.generateRefreshTokenValue(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .userId(user.getId())
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(accessToken, refreshTokenValue, jwtService.getAccessTokenExpirationMs());
    }
}
