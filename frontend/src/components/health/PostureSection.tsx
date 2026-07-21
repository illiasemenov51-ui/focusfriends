import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";

// Индексы landmark-ов позы MediaPipe: 0 = нос, 11/12 = левое/правое плечо.
const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

const BAD_POSTURE_THRESHOLD = 0.75; // насколько может "просесть" соотношение нос/плечи от калибровки
const BAD_POSTURE_SUSTAIN_MS = 3000; // сколько подряд держать плохую осанку, прежде чем сигналить
const BEEP_COOLDOWN_MS = 8000; // не чаще одного сигнала в этот промежуток

type Status = "idle" | "loading" | "no-pose" | "good" | "bad" | "error";

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 720;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.35);
    oscillator.onended = () => ctx.close();
  } catch {
    // аудио недоступно (например, страница ещё не получила жест пользователя) — тихо пропускаем
  }
}

export function PostureSection() {
  const [enabled, setEnabled] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [calibrated, setCalibrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<import("@mediapipe/tasks-vision").PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const baselineRatioRef = useRef<number | null>(null);
  const badSinceRef = useRef<number | null>(null);
  const lastBeepRef = useRef<number>(0);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    if (!enabled) {
      stopEverything();
      return;
    }

    let cancelled = false;

    async function start() {
      setStatus("loading");
      setErrorMessage(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setStatus("no-pose");
        loop();
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            e instanceof DOMException && e.name === "NotAllowedError"
              ? "Доступ к камере не разрешён — включи его в настройках браузера для этой страницы"
              : "Не получилось запустить камеру или модель распознавания позы"
          );
        }
      }
    }

    function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker) return;

      if (video.readyState >= 2) {
        const result = landmarker.detectForVideo(video, performance.now());
        processResult(result);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    function processResult(result: import("@mediapipe/tasks-vision").PoseLandmarkerResult) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      const landmarks = result.landmarks?.[0];
      if (!landmarks) {
        setStatus(calibrated ? "no-pose" : "no-pose");
        badSinceRef.current = null;
        return;
      }

      const nose = landmarks[NOSE];
      const leftShoulder = landmarks[LEFT_SHOULDER];
      const rightShoulder = landmarks[RIGHT_SHOULDER];

      // Точки для наглядности — рисуем поверх превью, ничего никуда не отправляется.
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#F0B65C";
          for (const p of [nose, leftShoulder, rightShoulder]) {
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      if (shoulderWidth < 0.02) {
        // слишком далеко/не видно плеч целиком
        return;
      }
      const ratio = (shoulderMidY - nose.y) / shoulderWidth;

      if (baselineRatioRef.current == null) {
        // без калибровки просто показываем, что поза отслеживается
        setStatus("good");
        return;
      }

      const now = performance.now();
      const isBad = ratio < baselineRatioRef.current * BAD_POSTURE_THRESHOLD;

      if (isBad) {
        if (badSinceRef.current == null) {
          badSinceRef.current = now;
        }
        const sustainedMs = now - badSinceRef.current;
        if (sustainedMs >= BAD_POSTURE_SUSTAIN_MS) {
          setStatus("bad");
          if (soundOnRef.current && now - lastBeepRef.current >= BEEP_COOLDOWN_MS) {
            playBeep();
            lastBeepRef.current = now;
          }
        }
      } else {
        badSinceRef.current = null;
        setStatus("good");
      }
    }

    start();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  function stopEverything() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    baselineRatioRef.current = null;
    badSinceRef.current = null;
    setCalibrated(false);
    setStatus("idle");
  }

  useEffect(() => {
    return () => stopEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCalibrate() {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker) return;

    const result = landmarker.detectForVideo(video, performance.now());
    const landmarks = result.landmarks?.[0];
    if (!landmarks) return;

    const nose = landmarks[NOSE];
    const leftShoulder = landmarks[LEFT_SHOULDER];
    const rightShoulder = landmarks[RIGHT_SHOULDER];
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

    baselineRatioRef.current = (shoulderMidY - nose.y) / shoulderWidth;
    badSinceRef.current = null;
    setCalibrated(true);
  }

  const statusLabel: Record<Status, { text: string; color: string }> = {
    idle: { text: "выключено", color: "#D9C4A0" },
    loading: { text: "запускаю камеру...", color: "#D9C4A0" },
    error: { text: "ошибка", color: "#E08669" },
    "no-pose": { text: "не вижу тебя в кадре", color: "#D9C4A0" },
    good: { text: calibrated ? "осанка в порядке" : "откалибруйся, сидя ровно", color: "#7FBF8F" },
    bad: { text: "выпрямись!", color: "#E08669" },
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Всё распознавание позы происходит прямо в браузере — видео никогда никуда не
        отправляется и не сохраняется, оно даже не покидает эту вкладку.
      </Alert>

      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={enabled ? <VideocamOffIcon /> : <VideocamIcon />}
              onClick={() => setEnabled((v) => !v)}
            >
              {enabled ? "Выключить камеру" : "Включить контроль осанки"}
            </Button>

            {enabled && status !== "loading" && status !== "error" && (
              <Button variant="outlined" startIcon={<CenterFocusStrongIcon />} onClick={handleCalibrate}>
                {calibrated ? "Откалибровать заново" : "Откалибровать (сядь ровно)"}
              </Button>
            )}

            <FormControlLabel
              control={<Switch checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} />}
              label={<Typography sx={{ fontSize: 16 }}>Звук</Typography>}
            />

            <Chip label={statusLabel[status].text} sx={{ color: statusLabel[status].color, borderColor: statusLabel[status].color }} />
          </Stack>

          {status === "loading" && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <CircularProgress size={18} />
              <Typography className="pixel-muted" sx={{ fontSize: 15 }}>
                загружаю модель распознавания позы...
              </Typography>
            </Stack>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {errorMessage}
            </Alert>
          )}

          {enabled && (
            <Box sx={{ position: "relative", width: 320, maxWidth: "100%" }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", transform: "scaleX(-1)" }} />
              <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scaleX(-1)" }}
              />
            </Box>
          )}

          {enabled && !calibrated && status !== "loading" && status !== "error" && (
            <Typography className="pixel-muted" sx={{ fontSize: 15, mt: 1.5 }}>
              Сядь так, как обычно сидишь правильно, и нажми «Откалибровать» — дальше буду
              сравнивать с этим положением.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
