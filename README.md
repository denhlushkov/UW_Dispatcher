# UW Dispatcher

**Uptime & Webhook Dispatcher** — платформа моніторингу та алертингу сервісів. Користувачі
реєструють HTTP-ендпоінти; система періодично їх опитує, веде стан кожного монітора
(`OK → DEGRADED → DOWN`), відкриває й закриває інциденти та доставляє сповіщення в Telegram,
Email або Webhook з гарантією at-least-once, експоненційним backoff і ключами ідемпотентності.

[![ci](https://github.com/denhlushkov/UW_Dispatcher/actions/workflows/ci.yml/badge.svg)](https://github.com/denhlushkov/UW_Dispatcher/actions/workflows/ci.yml)

## Що вміє система (цільовий обсяг)

- **probes** — розклад і виконання перевірок, класифікація `up` / `slow` / `fail`.
- **incident-engine** — машина станів з гістерезисом (пороги послідовних збоїв і відновлень),
  інциденти та події переходів (transactional outbox).
- **notifications** — fan-out подій у канали, черга доставок, ретраї з backoff + jitter,
  «мертві» доставки та їхній повтор, HMAC-підпис вебхуків.
- **catalog + api** — HTTP API для керування моніторами, каналами й підписками, перегляд
  інцидентів, журналу доставок і метрик uptime/латентності.

Повний опис — у [spec.md](spec.md): компоненти й межі модулів, ER-модель, сценарії оновлення даних.

## Документація

| Що                   | Де                                |
| -------------------- | --------------------------------- |
| Специфікація         | [spec.md](spec.md)                |
| Архітектурні рішення | [adr/](adr/README.md)             |
| Інженерні стандарти  | [standards/](standards/README.md) |
| Захист лабораторних  | [Лаб 1](defense/lab1/DEFENSE.md)  |

## Стек

Node.js 24 · TypeScript 6 (strict, ESM) · Fastify 5 · zod 4 · pino · Vitest ·
PostgreSQL (партиціонування, Лаб 2) · BullMQ + Redis (Лаб 2). Обґрунтування — [ADR-0001](adr/0001-modular-monolith-on-typescript.md).

## Швидкий старт

```bash
npm install          # також встановлює git-hooks (husky)
cp .env.example .env
npm run dev:api      # http://127.0.0.1:3000/health
```

## Команди

| Команда                | Що робить                                                   |
| ---------------------- | ----------------------------------------------------------- |
| `npm run verify`       | Увесь конвеєр перевірок (те саме, що pre-push і CI).        |
| `npm run verify:fast`  | Формат, лінтер, типи, межі модулів, стандарти документації. |
| `npm run fix`          | Автоформатування + автовиправлення лінтера.                 |
| `npm test`             | Unit-тести.                                                 |
| `npm run build`        | Збірка в `dist/`.                                           |
| `npm run test:smoke`   | Smoke-тест зібраного артефакту (`dist/`).                   |
| `npm run deps:check`   | Перевірка меж модулів (dependency-cruiser).                 |
| `npm run deps:graph`   | Діаграма залежностей модулів у форматі Mermaid.             |
| `npm run unused:check` | Невикористані файли, експорти й npm-залежності (knip).      |
| `npm run docs:check`   | Перевірка формату spec і ADR.                               |

Перелік перевірок і де вони запускаються — [standards/checks.md](standards/checks.md).

## Структура

```text
src/
├── app/        # composition roots (точки входу процесів)
├── api/        # HTTP-транспорт (Fastify)
├── modules/    # catalog · probes · incident-engine · notifications
├── platform/   # env, логер, (БД, черга)
└── shared/     # чисте ядро без залежностей
adr/            # архітектурні рішення (MADR)
standards/      # інженерні стандарти курсу
defense/        # матеріали захисту лабораторних
scripts/        # перевірка стандартів документації
test/           # smoke (далі — integration, e2e)
```

## Процес

Робота — у feature-гілках (`feature/labN-…`) через PR у `main`. Коміти — Conventional Commits.
Git-hooks блокують коміт, що не проходить формат/лінтер/типи/межі модулів/стандарти
документації, і push, що не проходить повний конвеєр. Definition of Done —
[standards/definition-of-done.md](standards/definition-of-done.md).
