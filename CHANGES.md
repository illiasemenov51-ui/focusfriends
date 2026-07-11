# FocusFriends — патч «Друзья + Календарь»

Только новые/изменённые файлы, пути совпадают с корнем твоего репозитория —
просто скопируй поверх (`git status` покажет ровно эти файлы).

## Как применить

```bash
# из корня focusfriends
unzip -o focusfriends-friends-calendar-patch.zip -d .
docker compose down -v      # схема БД не менялась, но social-service раньше не поднимался вообще
docker compose up --build
```

## Что изменилось и почему

### 1. `docker-compose.yml`
`social-service` раньше вообще не был описан в композе — при `docker compose up`
он не поднимался, и весь текущий рейтинг (`/api/leaderboard`) был мёртвым эндпоинтом.
Добавил сервис + `SOCIAL_SERVICE_URL` для `core-service` и `gateway-service`.

### 2. `social-service` — входящие заявки в друзья
Раньше можно было отправить заявку (`POST /api/friends/request/{id}`), но
адресат не мог узнать, что она пришла — эндпоинта для списка входящих не было.
Добавил:
```
GET /api/friends/pending   — заявки, ожидающие решения текущего пользователя
```
(`FriendshipRepository`, `FriendshipService`, `FriendController`)

### 3. `core-service` — данные друга (задачи, календарь)
Ключевой момент: `core-service` ничего не знает о дружбе — это домен
`social-service`. Добавил `SocialServiceClient` — внутренний HTTP-клиент,
который дергает `social-service:8083` напрямую по docker-сети (как уже
делает `social-service` для `/api/leaderboard/points`), с заголовком
`X-User-Id` вместо прохода через gateway.

Новые эндпоинты (оба доступны только если пользователи реально в друзьях —
иначе 404, по той же модели приватности, что уже в проекте — не 403, чтобы
не подтверждать существование чужих данных):

```
GET /api/tasks/friends/{friendId}/recent?limit=5
  → последние задачи друга: id, title, status, priority, createdAt
    (без description и deadline — не всё чужое стоит светить)

GET /api/habits/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
  → твой календарь: [{ date, completedCount, habitTitles }]

GET /api/habits/friends/{friendId}/calendar?from=&to=
  → календарь друга, тот же формат
```

### 4. Фронтенд
- `types/friend.ts`, `api/friendApi.ts` — заявки/друзья
- `api/taskApi.ts`, `api/habitApi.ts` — новые методы под эндпоинты выше
- `utils/level.ts` — формула уровня вынесена из `GamificationContext`,
  чтобы уровень друга считался **той же формулой**, что и твой
- `components/FriendsSection.tsx` — вкладка «ДРУЗЬЯ»: список с уровнем/XP
  (реальные очки из `/api/leaderboard?period=ALL`), входящие заявки,
  добавление по id, разворачиваемая лента последних тасков
- `components/CalendarSection.tsx` — вкладка «КАЛЕНДАРЬ»: месячная сетка,
  зелёные точки — твои привычки, розовые — выбранного друга
- `pages/DashboardPage.tsx` — подключил обе вкладки

Собрано и протипчекано (`tsc -b` + `vite build`) — ошибок нет.

## Известные ограничения (осознанно не стал решать сейчас)

- **Добавление друга только по UUID** — поиска по имени/email нет ни в
  `social-service`, ни в `auth-service`. Если захочешь — это отдельный
  эндпоинт в `auth-service` (`GET /api/users/search?query=`), скажи, дожму.
- **Заявку в друзья отправитель не видит в UI**, пока её не примут (só
  эндпоинт `/api/friends/pending` отдаёт только входящие). Не критично для
  MVP, но можно добавить `GET /api/friends/outgoing` по аналогии.
- **`notification-service`** тоже не поднимается в `docker-compose.yml` —
  не трогал, вне скоупа этой задачи.
