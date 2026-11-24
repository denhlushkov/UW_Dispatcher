import Fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify';

import { registerHealthRoutes } from './routes/health.routes.js';

interface ApiDependencies {
  /** Root logger from platform/logger; typed by its Fastify-facing surface. */
  logger: FastifyBaseLogger;
}

/**
 * HTTP transport layer. Knows about HTTP (routing, status codes, payload schemas) and
 * delegates every business operation to module services passed in `deps`.
 */
export function buildServer(deps: ApiDependencies): FastifyInstance {
  const app = Fastify({ loggerInstance: deps.logger });
  registerHealthRoutes(app);
  return app;
}
