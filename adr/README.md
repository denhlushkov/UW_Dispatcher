# Architecture Decision Records

Формат і правила — [standards/adr-format.md](../standards/adr-format.md), шаблон —
[standards/adr-template.md](../standards/adr-template.md). Перевіряється `npm run docs:check`.

| №    | Рішення                                                                                                        | Статус   | Дата       |
| ---- | -------------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| 0001 | [Модульний моноліт на TypeScript / Node.js з двома типами процесів](0001-modular-monolith-on-typescript.md)    | accepted | 2026-11-24 |
| 0002 | [Планувальник задач: BullMQ + Redis](0002-job-scheduler-bullmq-redis.md)                                       | accepted | 2026-11-24 |
| 0003 | [Доставка: at-least-once, outbox, ключі ідемпотентності](0003-at-least-once-delivery-with-idempotency-keys.md) | accepted | 2026-11-24 |
| 0004 | [Часові ряди: PostgreSQL з партиціонуванням за днями](0004-time-series-in-postgres-partitions.md)              | accepted | 2026-11-24 |
| 0005 | [Межі модулів перевіряються автоматично](0005-module-boundaries-as-code.md)                                    | accepted | 2026-11-24 |
