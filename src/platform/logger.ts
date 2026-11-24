import { pino, type Logger } from 'pino';

import type { Env } from './env.js';

export type { Logger };

/**
 * Root structured logger. Business-process correlation (bpId) is attached in lab 2
 * via AsyncLocalStorage mixin, so call sites never pass ids by hand.
 */
export function createLogger(env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>): Logger {
  return pino({
    level: env.LOG_LEVEL,
    base: { service: 'uw-dispatcher' },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: ['req.headers.authorization', '*.apiKey', '*.secret'], censor: '[redacted]' },
  });
}
