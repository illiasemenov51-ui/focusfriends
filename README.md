# FocusFriends — Auth Service + Gateway (MVP, Этап 1)

## Структура

```
focusfriends/
 ├─ auth-service/        # регистрация, логин, JWT, профиль пользователя
 ├─ gateway-service/     # Spring Cloud Gateway, валидация JWT на входе
 └─ docker-compose.yml
```

## Запуск локально (Docker)

```bash
docker compose up --build
```

Поднимутся:
- `postgres` — БД `auth_db` на `localhost:5432`
- `auth-service` — на `localhost:8081`
- `gateway-service` — на `localhost:8080`

Все запросы к API идут через gateway: `http://localhost:8080/api/...`

## Запуск без Docker (для разработки в IDE)

1. Подними Postgres локально (или через `docker compose up postgres`), создай БД `auth_db`.
2. Запусти `AuthServiceApplication` (порт 8081).
3. Запусти `GatewayServiceApplication` (порт 8080), укажи `AUTH_SERVICE_URL=http://localhost:8081`, если меняешь дефолт.

## Переменные окружения

| Переменная | Сервис | Описание | По умолчанию |
|---|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | auth-service | подключение к Postgres | localhost / 5432 / auth_db / focusfriends / focusfriends |
| `JWT_SECRET` | auth-service, gateway-service | секрет для подписи JWT (**должен совпадать** в обоих сервисах!) | dev-заглушка в application.yml |
| `JWT_ACCESS_EXP` | auth-service | срок жизни access-токена, мс | 900000 (15 мин) |
| `JWT_REFRESH_EXP` | auth-service | срок жизни refresh-токена, мс | 604800000 (7 дней) |
| `AUTH_SERVICE_URL` | gateway-service | адрес auth-service | http://localhost:8081 |

⚠️ В `docker-compose.yml` JWT_SECRET прокинут в оба сервиса из одной переменной — это важно, иначе gateway не сможет проверить подпись токенов, выданных auth-service.

## Примеры запросов (через gateway, порт 8080)

### Регистрация
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"illia@example.com","password":"password123","name":"Illia"}'
```
Ответ: `{ "accessToken": "...", "refreshToken": "...", "expiresInMs": 900000 }`

### Логин
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"illia@example.com","password":"password123"}'
```

### Мой профиль (нужен accessToken)
```bash
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```

### Обновить профиль
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Illia Semenov","avatarUrl":"https://example.com/avatar.png"}'
```

### Публичный профиль (без токена)
```bash
curl http://localhost:8080/api/users/<userId>
```

### Обновить access-токен
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

### Logout (гасит все refresh-токены пользователя)
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

## Как это устроено

- **auth-service** сам валидирует JWT для своих защищённых эндпоинтов (`/api/users/me`) — на случай прямых вызовов мимо gateway (например, в тестах).
- **gateway-service** тоже валидирует JWT (тем же секретом) перед проксированием — это первая линия защиты, а также прокидывает `X-User-Id` вниз, чтобы будущие сервисы (Task, Habit, Social) могли доверять этому заголовку и не парсить JWT самостоятельно.
- Refresh-токены хранятся в БД (`refresh_tokens`) и ротируются: при каждом `/refresh` старый токен гасится (`revoked=true`), выдаётся новая пара.
- Пароли хешируются BCrypt.

## Что дальше (Этап 2)

- `core-service` — Task + Habit (см. общий план MVP)
- Общая библиотека DTO/exception-handling между сервисами (опционально, для MVP можно дублировать)
- CI: GitHub Actions — build + test на push

## Известные упрощения MVP (осознанно)

- Google OAuth отложен на v1.1
- Kafka/событийная шина не используется — сервисы будут дёргать друг друга по REST
- Kubernetes не используется — только Docker Compose
