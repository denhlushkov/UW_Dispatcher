import { buildServer } from '../api/index.js';
import { loadEnv } from '../platform/env.js';
import { createLogger } from '../platform/logger.js';

/** Composition root of the API process: the only place that wires concrete resources. */
async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env);
  const app = buildServer({ logger });

  const shutdown = (signal: NodeJS.Signals): void => {
    logger.info({ signal }, 'shutting down');
    app.close().then(
      () => process.exit(0),
      (error: unknown) => {
        logger.error({ err: error }, 'graceful shutdown failed');
        process.exit(1);
      },
    );
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  await app.listen({ host: env.HTTP_HOST, port: env.HTTP_PORT });
}

main().catch((error: unknown) => {
  // Logger may not exist yet (e.g. invalid env), so fall back to stderr.
  process.stderr.write(
    `fatal: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(1);
});
