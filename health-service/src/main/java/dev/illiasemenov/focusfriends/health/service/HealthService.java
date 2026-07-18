package dev.illiasemenov.focusfriends.health.service;

import dev.illiasemenov.focusfriends.health.client.SocialServiceClient;
import dev.illiasemenov.focusfriends.health.dto.CheckinRequest;
import dev.illiasemenov.focusfriends.health.dto.WeeklySummaryResponse;
import dev.illiasemenov.focusfriends.health.entity.HealthCheckin;
import dev.illiasemenov.focusfriends.health.entity.HealthPrivacySettings;
import dev.illiasemenov.focusfriends.health.exception.HealthAccessDeniedException;
import dev.illiasemenov.focusfriends.health.repository.HealthCheckinRepository;
import dev.illiasemenov.focusfriends.health.repository.HealthPrivacySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class HealthService {

    private static final double TARGET_SLEEP_MIN = 7.0;
    private static final double TARGET_SLEEP_MAX = 9.0;

    private final HealthCheckinRepository checkinRepository;
    private final HealthPrivacySettingsRepository privacyRepository;
    private final SocialServiceClient socialServiceClient;

    public HealthService(HealthCheckinRepository checkinRepository,
                          HealthPrivacySettingsRepository privacyRepository,
                          SocialServiceClient socialServiceClient) {
        this.checkinRepository = checkinRepository;
        this.privacyRepository = privacyRepository;
        this.socialServiceClient = socialServiceClient;
    }

    @Transactional
    public HealthCheckin upsert(UUID userId, CheckinRequest request) {
        LocalDate date = request.date() != null ? request.date() : LocalDate.now();

        HealthCheckin checkin = checkinRepository.findByUserIdAndDate(userId, date)
                .orElseGet(() -> HealthCheckin.builder().userId(userId).date(date).build());

        checkin.setSleepHours(request.sleepHours());
        checkin.setEnergyLevel(request.energyLevel());
        checkin.setStressLevel(request.stressLevel());
        checkin.setMoodLevel(request.moodLevel());
        checkin.setNote(request.note());

        return checkinRepository.save(checkin);
    }

    public List<HealthCheckin> listOwn(UUID userId, LocalDate from, LocalDate to) {
        return checkinRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(userId, from, to);
    }

    public WeeklySummaryResponse getOwnSummary(UUID userId) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(6);
        List<HealthCheckin> checkins = checkinRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(userId, from, to);
        return summarize(from, to, checkins);
    }

    /** Сводка друга — только если вы реально друзья и он включил "делиться с друзьями". */
    public WeeklySummaryResponse getFriendSummary(UUID callerId, UUID friendId) {
        if (!socialServiceClient.areFriends(callerId, friendId)) {
            throw new HealthAccessDeniedException();
        }

        HealthPrivacySettings settings = privacyRepository.findById(friendId)
                .orElseGet(() -> HealthPrivacySettings.builder().userId(friendId).shareWithFriends(true).build());

        if (!settings.isShareWithFriends()) {
            throw new HealthAccessDeniedException();
        }

        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(6);
        List<HealthCheckin> checkins = checkinRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(friendId, from, to);
        return summarize(from, to, checkins);
    }

    public boolean getShareWithFriends(UUID userId) {
        return privacyRepository.findById(userId)
                .map(HealthPrivacySettings::isShareWithFriends)
                .orElse(true);
    }

    @Transactional
    public boolean setShareWithFriends(UUID userId, boolean share) {
        HealthPrivacySettings settings = privacyRepository.findById(userId)
                .orElseGet(() -> HealthPrivacySettings.builder().userId(userId).build());
        settings.setShareWithFriends(share);
        privacyRepository.save(settings);
        return share;
    }

    private WeeklySummaryResponse summarize(LocalDate from, LocalDate to, List<HealthCheckin> checkins) {
        if (checkins.isEmpty()) {
            return new WeeklySummaryResponse(from, to, false, 0, 0, 0, 0, 0, 0,
                    List.of("Пока нет отметок за эту неделю — начни отмечаться каждый день, чтобы видеть картину."));
        }

        double avgSleep = checkins.stream().mapToDouble(HealthCheckin::getSleepHours).average().orElse(0);
        double avgEnergy = checkins.stream().mapToInt(HealthCheckin::getEnergyLevel).average().orElse(0);
        double avgStress = checkins.stream().mapToInt(HealthCheckin::getStressLevel).average().orElse(0);
        double avgMood = checkins.stream().mapToInt(HealthCheckin::getMoodLevel).average().orElse(0);

        int loadIndex = computeLoadIndex(avgSleep, avgEnergy, avgStress);

        List<String> notes = new ArrayList<>();
        if (avgSleep < TARGET_SLEEP_MIN) {
            notes.add(String.format("Судя по твоим отметкам, сна в среднем %.1f ч/сутки — меньше нормы (7–9 ч).", avgSleep));
        } else if (avgSleep > TARGET_SLEEP_MAX) {
            notes.add(String.format("Сна в среднем %.1f ч/сутки — заметно больше обычной нормы, возможно стоит обратить внимание.", avgSleep));
        }
        if (avgStress >= 4.0) {
            notes.add("Уровень стресса был высоким почти всю неделю — по своим же отметкам.");
        }
        if (avgEnergy <= 2.0) {
            notes.add("Энергии по твоим отметкам было мало — возможно, стоит снизить нагрузку и добавить отдых.");
        }
        if (avgMood <= 2.0) {
            notes.add("Настроение по твоим отметкам было низким — если это длится не первую неделю, может помочь разговор с близким человеком или специалистом.");
        }
        if (notes.isEmpty()) {
            notes.add("По твоим отметкам неделя выглядит сбалансированной.");
        }

        return new WeeklySummaryResponse(
                from, to, true, checkins.size(),
                round1(avgSleep), round1(avgEnergy), round1(avgStress), round1(avgMood),
                loadIndex, notes
        );
    }

    /** 0..100: выше — тяжелее неделя (много стресса, мало энергии, недосып). */
    private int computeLoadIndex(double avgSleep, double avgEnergy, double avgStress) {
        double stressPart = (avgStress / 5.0) * 40.0;
        double energyPart = (1 - (avgEnergy / 5.0)) * 30.0;
        double sleepDeficit = Math.max(0, TARGET_SLEEP_MIN - avgSleep);
        double sleepPart = Math.min(1.0, sleepDeficit / TARGET_SLEEP_MIN) * 30.0;

        double total = stressPart + energyPart + sleepPart;
        return (int) Math.round(Math.max(0, Math.min(100, total)));
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
