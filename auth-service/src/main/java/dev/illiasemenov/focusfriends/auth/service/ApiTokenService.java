package dev.illiasemenov.focusfriends.auth.service;

import dev.illiasemenov.focusfriends.auth.entity.ApiToken;
import dev.illiasemenov.focusfriends.auth.exception.ApiTokenNotFoundException;
import dev.illiasemenov.focusfriends.auth.exception.InvalidApiTokenException;
import dev.illiasemenov.focusfriends.auth.repository.ApiTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class ApiTokenService {

    private static final String TOKEN_PREFIX = "ff_pat_";
    private static final int TOKEN_RANDOM_BYTES = 32;

    private final ApiTokenRepository apiTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public ApiTokenService(ApiTokenRepository apiTokenRepository) {
        this.apiTokenRepository = apiTokenRepository;
    }

    public record GeneratedToken(ApiToken entity, String plaintext) {
    }

    @Transactional
    public GeneratedToken generate(UUID userId, String name) {
        byte[] randomBytes = new byte[TOKEN_RANDOM_BYTES];
        secureRandom.nextBytes(randomBytes);
        String plaintext = TOKEN_PREFIX + HexFormat.of().formatHex(randomBytes);

        ApiToken token = ApiToken.builder()
                .userId(userId)
                .name(name)
                .tokenHash(hash(plaintext))
                .build();

        ApiToken saved = apiTokenRepository.save(token);
        return new GeneratedToken(saved, plaintext);
    }

    /** Возвращает userId владельца, если токен активен; обновляет lastUsedAt. */
    @Transactional
    public UUID validateAndTouch(String plaintextToken) {
        ApiToken token = apiTokenRepository.findByTokenHash(hash(plaintextToken))
                .filter(t -> !t.isRevoked())
                .orElseThrow(InvalidApiTokenException::new);

        token.setLastUsedAt(Instant.now());
        apiTokenRepository.save(token);
        return token.getUserId();
    }

    public List<ApiToken> list(UUID userId) {
        return apiTokenRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void revoke(UUID userId, UUID tokenId) {
        ApiToken token = apiTokenRepository.findById(tokenId)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new ApiTokenNotFoundException(tokenId));

        token.setRevoked(true);
        apiTokenRepository.save(token);
    }

    private String hash(String plaintext) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(plaintext.getBytes());
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 недоступен", e);
        }
    }
}
