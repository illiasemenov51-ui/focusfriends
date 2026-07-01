package dev.illiasemenov.focusfriends.auth.service;

import dev.illiasemenov.focusfriends.auth.dto.AuthResponse;
import dev.illiasemenov.focusfriends.auth.dto.LoginRequest;
import dev.illiasemenov.focusfriends.auth.dto.RegisterRequest;
import dev.illiasemenov.focusfriends.auth.entity.RefreshToken;
import dev.illiasemenov.focusfriends.auth.entity.Role;
import dev.illiasemenov.focusfriends.auth.entity.User;
import dev.illiasemenov.focusfriends.auth.exception.EmailAlreadyExistsException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidCredentialsException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidRefreshTokenException;
import dev.illiasemenov.focusfriends.auth.repository.RefreshTokenRepository;
import dev.illiasemenov.focusfriends.auth.repository.UserRepository;
import dev.illiasemenov.focusfriends.auth.security.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                        RefreshTokenRepository refreshTokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

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

        // rotate: старый refresh-токен гасим, выдаём новую пару
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return issueTokens(user);
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
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
