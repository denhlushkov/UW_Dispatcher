import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Smoke test of the *built* artifact: `node dist/app/api.main.js` must boot, listen and
 * answer /health. It catches what unit tests cannot: broken ESM import paths in emitted
 * JS, missing runtime dependencies, crashes in the composition root.
 */
const ENTRY = 'dist/app/api.main.js';

let child: ChildProcess | undefined;
let baseUrl = '';

function waitForListeningUrl(proc: ChildProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!proc.stdout) {
      reject(new Error('child has no stdout'));
      return;
    }
    const lines = createInterface({ input: proc.stdout });
    lines.on('line', (line) => {
      const match = /Server listening at (http:\/\/[^"\s]+)/.exec(line);
      if (match?.[1]) resolve(match[1]);
    });
    proc.once('exit', (code) => {
      reject(new Error(`api process exited early with code ${String(code)}`));
    });
  });
}

beforeAll(async () => {
  if (!existsSync(ENTRY)) throw new Error(`${ENTRY} not found: run \`npm run build\` first`);
  child = spawn(process.execPath, [ENTRY], {
    env: { ...process.env, NODE_ENV: 'test', LOG_LEVEL: 'info', HTTP_PORT: '0' },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  baseUrl = await waitForListeningUrl(child);
});

afterAll(() => {
  child?.kill();
});

describe('api smoke', () => {
  it('serves /health from the built artifact', async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });
});
