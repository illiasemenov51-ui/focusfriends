package dev.illiasemenov.focusfriends.health.service;

import dev.illiasemenov.focusfriends.health.client.SocialServiceClient;
import dev.illiasemenov.focusfriends.health.dto.CheckinRequest;
import dev.illiasemenov.focusfriends.health.dto.WeeklySummaryResponse;
import dev.illiasemenov.focusfriends.health.entity.HealthCheckin;
import dev.illiasemenov.focusfriends.health.entity.HealthSettings;
import dev.illiasemenov.focusfriends.health.exception.HealthAccessDeniedException;
import dev.illiasemenov.focusfriends.health.repository.HealthCheckinRepository;
import dev.illiasemenov.focusfriends.health.repository.HealthSettingsRepository;
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
    private final HealthSettingsRepository settingsRepository;
    private final SocialServiceClient socialServiceClient;

    public HealthService(HealthCheckinRepository checkinRepository,
                          HealthSettingsRepository settingsRepository,
                          SocialServiceClient socialServiceClient) {
        this.checkinRepository = checkinRepository;
        this.settingsRepository = settingsRepository;
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
        checkin.setCaloriesIntake(request.caloriesIntake());
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
        Integer calorieGoal = getSettings(userId).getCalorieGoal();
        return summarize(from, to, checkins, calorieGoal);
    }

    /** Сводка друга — только если вы реально друзья и он включил "делиться с друзьями". */
    public WeeklySummaryResponse getFriendSummary(UUID callerId, UUID friendId) {
        if (!socialServiceClient.areFriends(callerId, friendId)) {
            throw new HealthAccessDeniedException();
        }

        HealthSettings settings = getSettings(friendId);
        if (!settings.isShareWithFriends()) {
            throw new HealthAccessDeniedException();
        }

        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(6);
        List<HealthCheckin> checkins = checkinRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(friendId, from, to);
        return summarize(from, to, checkins, settings.getCalorieGoal());
    }

    public HealthSettings getSettings(UUID userId) {
        return settingsRepository.findById(userId)
                .orElseGet(() -> HealthSettings.builder().userId(userId).shareWithFriends(true).build());
    }

    @Transactional
    public HealthSettings updateSettings(UUID userId, boolean shareWithFriends, Integer calorieGoal) {
        HealthSettings settings = settingsRepository.findById(userId)
                .orElseGet(() -> HealthSettings.builder().userId(userId).build());
        settings.setShareWithFriends(shareWithFriends);
        settings.setCalorieGoal(calorieGoal);
        return settingsRepository.save(settings);
    }

    private WeeklySummaryResponse summarize(LocalDate from, LocalDate to, List<HealthCheckin> checkins, Integer calorieGoal) {
        if (checkins.isEmpty()) {
            return new WeeklySummaryResponse(from, to, false, 0, 0, 0, 0, 0, null, calorieGoal, 0,
                    List.of("Пока нет отметок за эту неделю — начни отмечаться каждый день, чтобы видеть картину."));
        }

        double avgSleep = checkins.stream().mapToDouble(HealthCheckin::getSleepHours).average().orElse(0);
        double avgEnergy = checkins.stream().mapToInt(HealthCheckin::getEnergyLevel).average().orElse(0);
        double avgStress = checkins.stream().mapToInt(HealthCheckin::getStressLevel).average().orElse(0);
        double avgMood = checkins.stream().mapToInt(HealthCheckin::getMoodLevel).average().orElse(0);

        List<Integer> caloriesEntries = checkins.stream()
                .map(HealthCheckin::getCaloriesIntake)
                .filter(java.util.Objects::nonNull)
                .toList();
        Double avgCalories = caloriesEntries.isEmpty() ? null
                : caloriesEntries.stream().mapToInt(Integer::intValue).average().orElse(0);

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
        if (avgCalories != null && calorieGoal != null && calorieGoal > 0) {
            double diffPercent = (avgCalories - calorieGoal) / calorieGoal * 100;
            if (Math.abs(diffPercent) >= 15) {
                notes.add(String.format("В среднем %.0f ккал/день при цели %d — расхождение около %.0f%%.",
                        avgCalories, calorieGoal, diffPercent));
            }
        }
        if (notes.isEmpty()) {
            notes.add("По твоим отметкам неделя выглядит сбалансированной.");
        }

        return new WeeklySummaryResponse(
                from, to, true, checkins.size(),
                round1(avgSleep), round1(avgEnergy), round1(avgStress), round1(avgMood),
                avgCalories != null ? round1(avgCalories) : null,
                calorieGoal,
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
