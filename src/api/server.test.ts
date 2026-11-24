import { describe, expect, it } from 'vitest';

import { createLogger } from '../platform/logger.js';
import { buildServer } from './server.js';

describe('buildServer', () => {
  const app = buildServer({ logger: createLogger({ LOG_LEVEL: 'silent', NODE_ENV: 'test' }) });

  it('answers /health with 200 and status ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });

  it('returns 404 for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/nope' });

    expect(response.statusCode).toBe(404);
  });
});
