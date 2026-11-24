/**
 * Enforces the documentation standards (standards/adr-format.md, standards/spec-format.md)
 * so they are checked by the git hook and CI instead of relying on reviewers' memory.
 *
 * Usage: npm run docs:check   (exit code 1 on any violation)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const ROOT = process.cwd();
const errors: string[] = [];
const fail = (file: string, message: string): void => {
  errors.push(`${file}: ${message}`);
};
const read = (path: string): string =>
  readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');

// ---------------------------------------------------------------- standards/
const REQUIRED_STANDARDS = [
  'standards/README.md',
  'standards/spec-format.md',
  'standards/adr-format.md',
  'standards/adr-template.md',
  'standards/definition-of-done.md',
  'standards/checks.md',
  'standards/code-style.md',
];
for (const file of REQUIRED_STANDARDS) {
  if (!existsSync(join(ROOT, file))) fail(file, 'required standard is missing');
}

// ---------------------------------------------------------------- adr/
const ADR_DIR = 'adr';
const ADR_FILE = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const ADR_STATUS = /^(proposed|accepted|rejected|deprecated|superseded by ADR-\d{4})$/;
const ADR_REQUIRED_HEADINGS = [
  '## Контекст і постановка проблеми',
  '## Чинники рішення',
  '## Розглянуті варіанти',
  '## Рішення',
  '### Наслідки',
  '### Підтвердження',
  '## Переваги та недоліки варіантів',
];

function frontmatter(text: string): Map<string, string> | undefined {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match?.[1]) return undefined;
  const fields = new Map<string, string>();
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator > 0) {
      const value = line
        .slice(separator + 1)
        .trim()
        .replace(/^"(.*)"$/, '$1');
      fields.set(line.slice(0, separator).trim(), value);
    }
  }
  return fields;
}

const adrFiles = existsSync(join(ROOT, ADR_DIR))
  ? readdirSync(join(ROOT, ADR_DIR)).filter((name) => name !== 'README.md')
  : [];
if (adrFiles.length === 0) fail(ADR_DIR, 'no ADRs found');

const adrIndex = existsSync(join(ROOT, ADR_DIR, 'README.md')) ? read(`${ADR_DIR}/README.md`) : '';
if (!adrIndex) fail(`${ADR_DIR}/README.md`, 'ADR index is missing');

const numbers: number[] = [];
for (const name of adrFiles) {
  const file = `${ADR_DIR}/${name}`;
  const nameMatch = ADR_FILE.exec(name);
  if (!nameMatch?.[1]) {
    fail(file, 'file name must be NNNN-kebab-case-title.md');
    continue;
  }
  const number = Number(nameMatch[1]);
  numbers.push(number);
  const text = read(file);

  const meta = frontmatter(text);
  if (!meta) {
    fail(file, 'YAML front matter (status, date, decision-makers) is missing');
  } else {
    const status = meta.get('status') ?? '';
    if (!ADR_STATUS.test(status)) fail(file, `invalid status "${status}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.get('date') ?? '')) fail(file, 'date must be YYYY-MM-DD');
    if (!meta.get('decision-makers')) fail(file, 'decision-makers is required');
  }

  const title = new RegExp(`^# ${nameMatch[1]}\\. \\S`, 'm');
  if (!title.test(text)) fail(file, `H1 must be "# ${nameMatch[1]}. <title>"`);

  let cursor = 0;
  for (const heading of ADR_REQUIRED_HEADINGS) {
    const at = text.indexOf(`\n${heading}\n`, cursor);
    if (at === -1) {
      fail(file, `missing or out-of-order section "${heading}"`);
    } else {
      cursor = at;
    }
  }
  if (!/Обраний варіант: «[^»]+»/.test(text)) {
    fail(file, 'decision must start with «Обраний варіант: «...»»');
  }
  if (adrIndex && !adrIndex.includes(`(${name})`))
    fail(`${ADR_DIR}/README.md`, `does not list ${name}`);
}
numbers
  .sort((a, b) => a - b)
  .forEach((number, index) => {
    if (number !== index + 1)
      fail(ADR_DIR, `ADR numbers must be sequential from 0001, gap at ${number}`);
  });

// ---------------------------------------------------------------- spec.md
const SPEC = 'spec.md';
const SPEC_SECTIONS = [
  'Контекст і цілі',
  'Вимоги',
  'Компоненти та межі модулів',
  'Модель даних',
  'Ключові сценарії',
  'Зовнішній інтерфейс',
  'Помилки та збої',
  'Трасування',
  'Відкриті питання',
];

if (existsSync(join(ROOT, SPEC))) {
  const spec = read(SPEC);
  const headings = [...spec.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => ({
    number: Number(m[1]),
    title: (m[2] ?? '').trim(),
  }));
  SPEC_SECTIONS.forEach((title, index) => {
    const heading = headings[index];
    if (heading?.number !== index + 1 || !heading.title.startsWith(title)) {
      fail(SPEC, `section ${index + 1} must be "## ${index + 1}. ${title}"`);
    }
  });

  // Requirement / scenario ids: defined once (table row or heading outside §8), traced in §8.
  const traceStart = spec.search(/^## 8\. /m);
  const traceEnd = spec.search(/^## 9\. /m);
  const trace = traceStart >= 0 ? spec.slice(traceStart, traceEnd >= 0 ? traceEnd : undefined) : '';
  const body = traceStart >= 0 ? spec.replace(trace, '') : spec;

  const defined = [...body.matchAll(/^(?:\| |### )((?:FR|NFR|SC)-\d{2})\b/gm)].map(
    (m) => m[1] ?? '',
  );
  if (defined.length === 0) fail(SPEC, 'no FR-/NFR-/SC- identifiers defined');
  const duplicates = defined.filter((id, i) => defined.indexOf(id) !== i);
  for (const id of new Set(duplicates)) fail(SPEC, `${id} is defined more than once`);

  // A mention inside another row is not enough: every FR/SC needs its own trace row.
  for (const id of new Set(defined)) {
    const ownRow = new RegExp(`^\\| ${id} +\\|`, 'm');
    if (!id.startsWith('NFR') && !ownRow.test(trace)) fail(SPEC, `${id} has no row in §8`);
  }

  // Every module-boundary rule enforced by dependency-cruiser must be explained in spec §3.
  const require = createRequire(import.meta.url);
  const cruiser = require(join(ROOT, '.dependency-cruiser.cjs')) as {
    forbidden: { name: string }[];
  };
  for (const rule of cruiser.forbidden) {
    if (!spec.includes(`\`${rule.name}\``)) {
      fail(SPEC, `dependency rule \`${rule.name}\` is not documented in §3`);
    }
  }
} else {
  fail(SPEC, 'spec is missing');
}

// ---------------------------------------------------------------- report
if (errors.length > 0) {
  console.error(`docs:check found ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(
  `docs:check ok (${adrFiles.length} ADRs, spec, ${REQUIRED_STANDARDS.length} standards)`,
);
