# Стандарт: стиль коду та процес

Форматування не обговорюється — його робить Prettier (`printWidth 100`, одинарні лапки,
trailing commas, LF). Нижче — те, чого Prettier не вирішує.

## Мова і TypeScript

| Правило                                                                                           | Навіщо                                                        | Механізм                      |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature` | Помилки `undefined` і неочевидні звернення ловить компілятор. | `tsc`                         |
| Без `any`; зовнішні дані — `unknown` + схема (zod)                                                | Дані з HTTP/БД/env не довіряються без валідації.              | ESLint `no-unsafe-*`          |
| Без `enum` — `as const` масив + union-тип                                                         | Enum генерує runtime-код і погано звужується.                 | ESLint `no-restricted-syntax` |
| Ідентифікатори — branded types (`MonitorId`, `ChannelId`)                                         | Не можна передати ID каналу туди, де очікується ID монітора.  | `tsc`                         |
| Явний тип результату експортованих функцій                                                        | Публічний контракт не змінюється випадково.                   | ESLint                        |
| `import type` для типів; відносні імпорти з `.js`                                                 | Коректний ESM у Node без бандлера.                            | ESLint, `tsc` NodeNext        |
| Немає floating promises; `switch` по union — вичерпний                                            | Втрачені помилки й забуті гілки.                              | ESLint                        |

## Іменування файлів

- `kebab-case.ts`; суфікс за роллю: `*.routes.ts` (HTTP), `*.service.ts` (бізнес-операції),
  `*.repository.ts` (SQL), `*.test.ts` (тести поруч із кодом), `*.main.ts` (точки входу).
- Кожен модуль має `index.ts` — публічний API. Усе, що не експортовано з `index.ts`, — приватне.

## Шари

| Шар                      | Знає про                                  | Не знає про                     |
| ------------------------ | ----------------------------------------- | ------------------------------- |
| `api/routes`             | HTTP: шляхи, коди, схеми, заголовки       | SQL, транзакції, бізнес-правила |
| `modules/*/*.service`    | бізнес-операції, перевірки доступу        | HTTP, SQL                       |
| `modules/*/*.repository` | SQL, транзакції, маппінг рядків           | HTTP, бізнес-рішення            |
| `modules/*/domain`       | правила й типи (чисті функції)            | IO будь-якого виду              |
| `platform`               | технічні ресурси (env, логер, пул, черга) | бізнес-модулі                   |

Межі шарів автоматично перевіряє dependency-cruiser (spec §3.4).

## Помилки

- Доменні помилки — класи з кодом (`NotFoundError`, `ConflictError`, …) у `shared`/модулях; HTTP-
  код призначає **один** глобальний обробник в `api` (Лаб 2).
- `try/catch` лише там, де є конкретна дія: ретрай, компенсація, переклад помилки іншого шару.
  Заборонено «огортати все тіло функції» і ковтати помилку.

## Логування

- Лише через `platform/logger` (ESLint `no-console`; dependency-cruiser `logger-impl-only-in-platform`).
- Структуровані поля, а не інтерполяція: `logger.info({ monitorId }, 'check scheduled')`.
- Кожен рядок містить `bpId` (Лаб 2, AsyncLocalStorage). Секрети редагуються (`redact`).

## Коміти й гілки

- **Conventional Commits**: `type(scope): опис`. Типи: `feat`, `fix`, `refactor`, `test`, `docs`,
  `chore`, `ci`, `build`, `perf`. Scopes: `api`, `catalog`, `probes`, `incident-engine`,
  `notifications`, `platform`, `app`, `deps`, `docs`, `ci`, `lab1`…`lab3` (перевіряє commitlint).
- Гілки: `feature/labN-короткий-опис`, `fix/…`. Робота — лише через PR у `main`; `main` завжди зелений.
- Один коміт — одна логічна зміна, що проходить усі перевірки.
