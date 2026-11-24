import type { FastifyInstance } from 'fastify';

interface HealthResponse {
  status: 'ok';
  uptimeSeconds: number;
}

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/health', (): HealthResponse => ({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
  }));
}
