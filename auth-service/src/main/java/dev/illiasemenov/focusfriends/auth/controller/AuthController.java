package dev.illiasemenov.focusfriends.auth.controller;

import dev.illiasemenov.focusfriends.auth.dto.AuthResponse;
import dev.illiasemenov.focusfriends.auth.dto.LoginRequest;
import dev.illiasemenov.focusfriends.auth.dto.RefreshRequest;
import dev.illiasemenov.focusfriends.auth.dto.RequestPasswordResetRequest;
import dev.illiasemenov.focusfriends.auth.dto.RegisterRequest;
import dev.illiasemenov.focusfriends.auth.dto.ResetPasswordRequest;
import dev.illiasemenov.focusfriends.auth.dto.VerifyEmailRequest;
import dev.illiasemenov.focusfriends.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        authService.logout(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.token());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        authService.resendVerification(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<Void> requestPasswordReset(@Valid @RequestBody RequestPasswordResetRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
