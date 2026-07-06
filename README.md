# FocusFriends

Совместный тайм-менеджмент и трекер привычек с элементами соревнования — бэкенд на микросервисной архитектуре (Java 25, Spring Boot 3, Spring Cloud Gateway, PostgreSQL, Docker).

Портфолио-проект уровня стажировки / junior Backend Engineer: REST API, JWT-аутентификация, API Gateway, изоляция БД по сервисам, Docker Compose для локального деплоя.

## Архитектура

```
                         ┌──────────────────┐
                         │   React Client    │   (в разработке)
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  gateway-service  │  :8080
                         │  Spring Cloud     │  — валидирует JWT, роутит,
                         │  Gateway          │     прокидывает X-User-Id
                         └─────────┬─────────┘
             ┌──────────┬──────────┼──────────┬──────────┐
             ▼          ▼          ▼          ▼          ▼
        ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐
        │  auth  │ │  core  │ │ social │ │ notif. │ │ (planned:    │
        │ :8081  │ │ :8082  │ │ :8083  │ │ :8084  │ │  analytics)  │
        └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └──────────────┘
            │          │          │          │
            ▼          ▼          ▼          ▼
        ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
        │auth_db │ │core_db │ │social_db│ │notification_│
        │        │ │        │ │        │ │_db          │
        └────────┘ └────────┘ └────────┘ └────────────┘
              (все — в одном контейнере postgres, разные БД)
```

Каждый сервис — независимый Spring Boot проект со своей БД. `gateway-service` — единая точка входа: валидирует JWT и прокидывает `X-User-Id` вниз, поэтому остальные сервисы не парсят токены сами, а просто доверяют заголовку.

## Сервисы

| Сервис | Порт | Ответственность |
|---|---|---|
| `gateway-service` | 8080 | Spring Cloud Gateway: роутинг, валидация JWT, `X-User-Id` |
| `auth-service` | 8081 | Регистрация, логин, JWT (access + refresh), профиль пользователя |
| `core-service` | 8082 | Задачи (Task) и привычки (Habit) с подсчётом streak |
| `social-service` | 8083 | Друзья, группы, рейтинг (Leaderboard) по очкам |
| `notification-service` | 8084 | In-app уведомления (+ заготовка под email) |

## Стек

- **Backend:** Java 25, Spring Boot 3.3, Spring Security, Spring Data JPA, Spring Cloud Gateway, Hibernate
- **Auth:** JWT (jjwt), BCrypt, access + refresh токены с ротацией
- **DB:** PostgreSQL 16, отдельная схема на сервис
- **Infra:** Docker, Docker Compose, многоступенчатые Dockerfile (Maven build → JRE runtime)

## Запуск локально

Требуется Docker Desktop.

```bash
git clone https://github.com/illiasemenov51-ui/focusfriends.git
cd focusfriends
docker compose up --build
```

Поднимутся 6 контейнеров: `postgres` + 5 сервисов. Все запросы — через gateway: `http://localhost:8080/api/...`.

Первый запуск создаёт 4 базы данных через `init-scripts/init-multiple-dbs.sh`. Если меняли схему БД и нужно всё пересоздать с нуля:

```bash
docker compose down -v
docker compose up --build
```

## Переменные окружения

| Переменная | Где используется | Описание |
|---|---|---|
| `JWT_SECRET` | auth-service, gateway-service | Секрет для подписи/валидации JWT — **должен совпадать** в обоих сервисах |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | все сервисы с БД | Подключение к Postgres, у каждого сервиса своя `DB_NAME` |
| `*_SERVICE_URL` | gateway-service | Адреса downstream-сервисов для роутинга |
| `MAIL_ENABLED` | notification-service | `false` по умолчанию — реальная отправка email отключена, уведомления сохраняются как in-app |

Дефолты для локальной разработки уже прописаны в `docker-compose.yml`.

## Аутентификация

```bash
# Регистрация
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Illia"}'
# → { "accessToken": "...", "refreshToken": "...", "expiresInMs": 900000 }
```

Дальше в защищённых запросах: `-H "Authorization: Bearer <accessToken>"`.

Остальные эндпоинты auth-service: `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/users/me`, `PUT /api/users/me`, `GET /api/users/{id}` (публичный профиль).

## API по сервисам

### Core Service — задачи

```
POST   /api/tasks                    создать
GET    /api/tasks?status=&priority=  список (пагинация, фильтры)
PUT    /api/tasks/{id}                обновить
DELETE /api/tasks/{id}                удалить
PATCH  /api/tasks/{id}/complete       отметить выполненной
```

### Core Service — привычки

```
POST   /api/habits                   создать
GET    /api/habits                   список
PUT    /api/habits/{id}               обновить
DELETE /api/habits/{id}               удалить
PATCH  /api/habits/{id}/log?date=     отметить выполнение (по умолчанию — сегодня)
GET    /api/habits/{id}/streak        текущая серия дней подряд
```

### Social Service — друзья

```
POST /api/friends/request/{userId}    отправить заявку
POST /api/friends/accept/{requestId}  принять заявку
GET  /api/friends                     список друзей
```

### Social Service — группы

```
POST /api/groups                      создать (создатель — первый участник)
POST /api/groups/{id}/join            вступить
GET  /api/groups/{id}/members         список участников
```

### Social Service — рейтинг

```
GET /api/leaderboard?period=week|month|all   рейтинг по очкам
```

### Notification Service

```
GET   /api/notifications              список своих уведомлений
PATCH /api/notifications/{id}/read    отметить прочитанным
```

## Как это устроено внутри

- **JWT** — access-токен живёт 15 минут, refresh — 7 дней. Refresh-токены хранятся в БД auth-service и ротируются при каждом обновлении (старый гасится, выдаётся новый).
- **X-User-Id** — gateway валидирует JWT один раз и прокидывает `userId` вниз простым заголовком. `core-service`, `social-service`, `notification-service` не парсят JWT самостоятельно — это ускоряет их и снимает с них ответственность за секрет подписи. Каждый из них ставит интерцептор, который требует этот заголовок на защищённых путях.
- **Внутренние эндпоинты** — `POST /api/leaderboard/points` и `POST /api/notifications/send` вызываются другими сервисами напрямую по внутренней docker-сети (например, `http://social-service:8083/...`), минуя gateway — у них другая модель доверия (сервис-сервис, а не пользователь-сервис).
- **Изоляция ошибок** — у каждого сервиса свой `GlobalExceptionHandler` с единым форматом ответа об ошибке (`timestamp`, `status`, `error`, `message`).
- **Владение ресурсами** — во всех сервисах проверка "это моя задача / привычка / уведомление?" реализована через сравнение `userId` из контекста с владельцем записи; при несовпадении отдаётся `404`, а не `403` — чтобы не подтверждать существование чужих ресурсов.

## Известные упрощения MVP (осознанные trade-off'ы)

- **Google OAuth** — отложен, пока только email/password
- **Kafka / событийная шина** — не используется, сервисы взаимодействуют по REST напрямую
- **Email-отправка** — заготовка есть (Spring Mail), но выключена по умолчанию (`MAIL_ENABLED=false`), поскольку требует реального SMTP; уведомления сохраняются как in-app
- **Начисление очков за задачи/привычки** — эндпоинт в social-service готов (`POST /api/leaderboard/points`), но core-service пока не вызывает его автоматически при завершении задачи — это следующий шаг интеграции
- **Kubernetes** — не используется, только Docker Compose

## Дальнейшие шаги

- [ ] Интеграция core-service → social-service (автоматическое начисление очков)
- [ ] Frontend на React + TypeScript
- [ ] CI: GitHub Actions (build + test на каждый push)
- [ ] Google OAuth в auth-service
- [ ] Тесты (unit + integration) для сервисного слоя
