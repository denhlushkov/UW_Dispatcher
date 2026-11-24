import { describe, expect, it } from 'vitest';

import { loadEnv } from './env.js';

describe('loadEnv', () => {
  it('applies defaults for an empty environment', () => {
    expect(loadEnv({})).toEqual({
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      HTTP_HOST: '127.0.0.1',
      HTTP_PORT: 3000,
    });
  });

  it('coerces the port from a string', () => {
    expect(loadEnv({ HTTP_PORT: '8080' }).HTTP_PORT).toBe(8080);
  });

  it.each([['-1'], ['65536'], ['abc'], ['3.5']])('fails fast on invalid port %s', (port) => {
    expect(() => loadEnv({ HTTP_PORT: port })).toThrow(/Invalid environment configuration/);
  });

  it('rejects an unknown log level instead of silently defaulting', () => {
    expect(() => loadEnv({ LOG_LEVEL: 'verbose' })).toThrow(/LOG_LEVEL/);
  });
});
