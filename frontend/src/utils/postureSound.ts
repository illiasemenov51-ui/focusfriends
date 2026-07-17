const CUSTOM_SOUND_KEY = "focusfriends.posture.customSound";
const PRESET_KEY = "focusfriends.posture.soundPreset";

export type SoundPreset = "chirp" | "double" | "bell" | "custom";

export const SOUND_PRESET_LABELS: Record<SoundPreset, string> = {
  chirp: "Короткий сигнал",
  double: "Два коротких",
  bell: "Колокольчик",
  custom: "Свой звук",
};

export function getSelectedPreset(): SoundPreset {
  const stored = localStorage.getItem(PRESET_KEY);
  if (stored === "chirp" || stored === "double" || stored === "bell" || stored === "custom") {
    return stored;
  }
  return "chirp";
}

export function setSelectedPreset(preset: SoundPreset): void {
  localStorage.setItem(PRESET_KEY, preset);
}

export function getCustomSoundDataUrl(): string | null {
  return localStorage.getItem(CUSTOM_SOUND_KEY);
}

export function saveCustomSound(dataUrl: string): void {
  localStorage.setItem(CUSTOM_SOUND_KEY, dataUrl);
}

export function clearCustomSound(): void {
  localStorage.removeItem(CUSTOM_SOUND_KEY);
}

function getAudioContext(): AudioContext {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new AudioCtx();
}

function tone(ctx: AudioContext, startAt: number, freq: number, durationSec: number, type: OscillatorType = "sine") {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  gain.gain.setValueAtTime(0.15, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + durationSec);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startAt);
  oscillator.stop(ctx.currentTime + startAt + durationSec);
}

function playPreset(preset: Exclude<SoundPreset, "custom">) {
  const ctx = getAudioContext();
  if (preset === "chirp") {
    tone(ctx, 0, 720, 0.35);
  } else if (preset === "double") {
    tone(ctx, 0, 660, 0.15);
    tone(ctx, 0.2, 660, 0.15);
  } else if (preset === "bell") {
    tone(ctx, 0, 880, 0.6, "triangle");
  }
  window.setTimeout(() => ctx.close(), 900);
}

/** Играет текущий выбранный сигнал (пресет или загруженный файл). Не бросает исключений. */
export function playAlertSound(): void {
  try {
    const preset = getSelectedPreset();
    if (preset === "custom") {
      const dataUrl = getCustomSoundDataUrl();
      if (dataUrl) {
        const audio = new Audio(dataUrl);
        audio.volume = 0.6;
        void audio.play().catch(() => {
          // автоплей заблокирован без недавнего жеста пользователя — тихо пропускаем
        });
        return;
      }
      // своего звука нет — fallback на обычный сигнал
      playPreset("chirp");
      return;
    }
    playPreset(preset);
  } catch {
    // аудио недоступно — тихо пропускаем, это не критично для основной функции
  }
}

/** Проигрывает конкретный пресет для предпрослушивания в настройках. */
export function previewPreset(preset: Exclude<SoundPreset, "custom">): void {
  try {
    playPreset(preset);
  } catch {
    // ignore
  }
}
