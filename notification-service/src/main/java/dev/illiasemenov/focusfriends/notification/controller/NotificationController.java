package dev.illiasemenov.focusfriends.notification.controller;

import dev.illiasemenov.focusfriends.notification.dto.NotificationResponse;
import dev.illiasemenov.focusfriends.notification.dto.SendNotificationRequest;
import dev.illiasemenov.focusfriends.notification.entity.Notification;
import dev.illiasemenov.focusfriends.notification.security.CurrentUserContext;
import dev.illiasemenov.focusfriends.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** Внутренний эндпоинт: вызывается другими сервисами напрямую, минуя gateway. */
    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody SendNotificationRequest request) {
        Notification notification = notificationService.send(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(NotificationResponse.from(notification));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list() {
        List<NotificationResponse> notifications = notificationService.listForUser(CurrentUserContext.get()).stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable UUID id) {
        Notification notification = notificationService.markRead(CurrentUserContext.get(), id);
        return ResponseEntity.ok(NotificationResponse.from(notification));
    }
}
