# Стандарт: перелік автоматичних перевірок

Принцип: **одна й та сама перевірка запускається однаковою командою локально, у hook-ах і в CI**.
Hook — швидкий зворотний зв'язок, CI — гарантія (hook можна не встановити, CI — ні).

## Перелік

| ID     | Перевірка                       | Інструмент / команда                                           | pre-commit | pre-push | CI  | Від чого захищає                                                              |
| ------ | ------------------------------- | -------------------------------------------------------------- | :--------: | :------: | :-: | ----------------------------------------------------------------------------- |
| CHK-01 | Формат                          | Prettier: `npm run format:check`                               |   staged   |    ✅    | ✅  | Шум у diff, суперечки про стиль.                                              |
| CHK-02 | Лінтер (зі строгими типами)     | ESLint + typescript-eslint `strictTypeChecked`: `npm run lint` |   staged   |    ✅    | ✅  | Floating promises, `any`, небезпечні операції, `console.*`, неповні `switch`. |
| CHK-03 | Перевірка типів                 | `tsc --noEmit`: `npm run typecheck`                            |     ✅     |    ✅    | ✅  | Помилки типів у всьому проєкті, а не лише в змінених файлах.                  |
| CHK-04 | Межі модулів і шарів            | dependency-cruiser: `npm run deps:check`                       |     ✅     |    ✅    | ✅  | Цикли, обхід публічного API, SQL поза репозиторіями, Fastify поза api.        |
| CHK-05 | Стандарти документації          | `npm run docs:check`                                           |     ✅     |    ✅    | ✅  | ADR без обов'язкових розділів, розсинхрон spec і правил меж.                  |
| CHK-06 | Невикористаний код і залежності | knip: `npm run unused:check`                                   |     —      |    ✅    | ✅  | Зайві npm-залежності, мертві файли й експорти.                                |
| CHK-07 | Unit-тести                      | Vitest: `npm test`                                             |     —      |    ✅    | ✅  | Регресії доменної логіки.                                                     |
| CHK-08 | Збірка                          | `tsc -p tsconfig.build.json`: `npm run build`                  |     —      |    ✅    | ✅  | Код, що типізується, але не збирається в runnable JS.                         |
| CHK-09 | Smoke-тест артефакту            | Vitest: `npm run test:smoke`                                   |     —      |    ✅    | ✅  | Зламаний старт: шляхи ESM-імпортів, відсутні runtime-залежності.              |
| CHK-10 | Повідомлення коміту             | commitlint (Conventional Commits + scopes)                     | commit-msg |    —     |  —  | Нечитабельна історія, неможливість згенерувати changelog.                     |
| CHK-11 | Залежності без уразливостей     | `npm audit --audit-level=high`                                 |     —      |    —     | ✅  | Відомі CVE у залежностях.                                                     |

Плановані (додаються з відповідною лабораторною):

| ID     | Перевірка                        | Лаб | Команда                    |
| ------ | -------------------------------- | --- | -------------------------- |
| CHK-12 | Інтеграційні тести з БД          | 2–3 | `npm run test:integration` |
| CHK-13 | E2E через HTTP API               | 3   | `npm run test:e2e`         |
| CHK-14 | Покриття гілок критичних модулів | 3   | `npm run test:coverage`    |
| CHK-15 | Мутаційне тестування             | 3   | `npm run test:mutation`    |

## Hook-и (husky)

- **pre-commit** (бюджет ≤ 15 с): `lint-staged` (CHK-01, CHK-02 лише для staged-файлів у режимі
  перевірки, **без автовиправлень** — коміт блокується, а не тихо змінюється), потім CHK-03,
  CHK-04, CHK-05 для всього проєкту.
- **commit-msg**: CHK-10.
- **pre-push**: `npm run verify` — повний конвеєр, ідентичний CI.

Виправити форматування й автовиправні помилки лінтера: `npm run fix`.

## CI

`.github/workflows/ci.yml`: на кожен push і PR у `main` — `npm ci`, `npm run verify`,
`npm audit --audit-level=high`. Червоний CI блокує merge.

## Правила

- Перевірку не можна вимкнути без ADR (див. [adr-format.md](adr-format.md#коли-adr-обовязковий)).
- `eslint-disable` дозволений лише точково (`eslint-disable-next-line rule -- причина`);
  невикористані директиви — помилка (`reportUnusedDisableDirectives`).
- `--no-verify` заборонений.
