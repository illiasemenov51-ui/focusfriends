# FocusFriends — геймификация (XP/уровни/анимации) + Docker для фронтенда

## Что внутри

- `files/` — новые и изменённые файлы фронтенда (XP-контекст, XP-бар, тосты,
  окно левел-апа, Dockerfile, nginx.conf) + обновлённый `docker-compose.yml`
  (добавлен сервис `frontend`).
- `install.sh` — копирует всё это поверх твоего проекта.

## Установка

1. Распакуй архив.
2. В терминале:

   ```bash
   chmod +x install.sh
   ./install.sh /путь/к/твоему/проекту/focusfriends
   ```

   Если запускаешь скрипт прямо из корня проекта — путь можно не указывать:

   ```bash
   cd /путь/к/твоему/проекту/focusfriends
   /путь/к/распакованному/архиву/install.sh
   ```

3. Старый `docker-compose.yml` сохранится рядом как `docker-compose.yml.bak`
   (на случай, если ты его уже сам менял — сверься перед следующим шагом).

4. Собери и подними всё через Docker:

   ```bash
   docker compose up -d --build
   ```

5. Открой http://localhost:3000 — это фронтенд (nginx отдаёт собранный Vite-билд).
   Gateway как и раньше слушает http://localhost:8080.

## Если Docker не нужен, только код

Просто скопируй файлы из `files/frontend/` в свой `frontend/` вручную или
через `install.sh`, а дальше как обычно:

```bash
cd frontend
npm install
npm run dev
```

## Проверка перед коммитом

```bash
cd frontend
npx tsc --noEmit -p tsconfig.app.json   # проверка типов
npm run build                           # сборка
```
