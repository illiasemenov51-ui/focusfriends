package dev.illiasemenov.focusfriends.gateway.security;

import dev.illiasemenov.focusfriends.gateway.config.GatewaySecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtValidator {

    private final SecretKey signingKey;

    public JwtValidator(GatewaySecurityProperties properties) {
        this.signingKey = Keys.hmacShaKeyFor(properties.jwt().secret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Возвращает userId (subject), если токен — валидный, неистёкший access-токен.
     * Иначе Optional.empty().
     */
    public Optional<String> validateAndExtractUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            boolean isAccess = "access".equals(claims.get("type", String.class));
            boolean notExpired = claims.getExpiration().after(new Date());

            if (isAccess && notExpired) {
                return Optional.of(claims.getSubject());
            }
            return Optional.empty();
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
