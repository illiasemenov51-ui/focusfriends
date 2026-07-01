package dev.illiasemenov.focusfriends.auth.security;

import dev.illiasemenov.focusfriends.auth.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.accessTokenExpirationMs());

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /** Refresh-токен: случайная строка + JWT-обвязка, чтобы можно было хранить/сверять в БД. */
    public String generateRefreshTokenValue(UUID userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.refreshTokenExpirationMs());

        return Jwts.builder()
                .subject(userId.toString())
                .claim("type", "refresh")
                .claim("jti", UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public long getAccessTokenExpirationMs() {
        return jwtProperties.accessTokenExpirationMs();
    }

    public long getRefreshTokenExpirationMs() {
        return jwtProperties.refreshTokenExpirationMs();
    }

    /** Возвращает claims, если токен структурно валиден и подпись верна; иначе Optional.empty(). */
    public Optional<Claims> parseClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public boolean isExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    public UUID extractUserId(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }
}
