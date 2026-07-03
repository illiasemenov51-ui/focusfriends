package dev.illiasemenov.focusfriends.notification.service;

import dev.illiasemenov.focusfriends.notification.config.AppProperties;
import dev.illiasemenov.focusfriends.notification.dto.SendNotificationRequest;
import dev.illiasemenov.focusfriends.notification.entity.Notification;
import dev.illiasemenov.focusfriends.notification.entity.NotificationChannel;
import dev.illiasemenov.focusfriends.notification.exception.NotificationNotFoundException;
import dev.illiasemenov.focusfriends.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    public NotificationService(NotificationRepository notificationRepository,
                                JavaMailSender mailSender,
                                AppProperties appProperties) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
        this.appProperties = appProperties;
    }

    @Transactional
    public Notification send(SendNotificationRequest request) {
        NotificationChannel channel = request.channel() != null ? request.channel() : NotificationChannel.IN_APP;

        Notification notification = Notification.builder()
                .userId(request.userId())
                .type(request.type())
                .message(request.message())
                .channel(channel)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);

        if (channel == NotificationChannel.EMAIL) {
            trySendEmail(request);
        }

        return notification;
    }

    /**
     * Реальная отправка email — опциональна для MVP (флаг app.mail-enabled).
     * Заметим: у notification-service нет email пользователя (только userId),
     * поэтому в текущем виде это заготовка под будущую интеграцию с auth-service
     * (получить email по userId) — сейчас просто логируем попытку.
     */
    private void trySendEmail(SendNotificationRequest request) {
        if (!appProperties.mailEnabled()) {
            log.info("Email-отправка отключена (app.mail-enabled=false), уведомление сохранено только как запись в БД. userId={}, type={}",
                    request.userId(), request.type());
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(appProperties.mailFrom());
            mail.setSubject("FocusFriends: " + request.type());
            mail.setText(request.message());
            // TODO: подставить реальный email получателя (нужна интеграция с auth-service)
            mailSender.send(mail);
        } catch (MailException e) {
            log.warn("Не удалось отправить email-уведомление userId={}: {}", request.userId(), e.getMessage());
        }
    }

    public List<Notification> listForUser(UUID userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Notification markRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException(notificationId);
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
