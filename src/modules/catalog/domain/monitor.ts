import type { Brand } from '../../../shared/brand.js';

export type UserId = Brand<string, 'UserId'>;
export type MonitorId = Brand<string, 'MonitorId'>;

export const HTTP_METHODS = ['GET', 'HEAD', 'POST'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

/** What to probe and what counts as a successful response. */
export interface ProbeTarget {
  url: string;
  method: HttpMethod;
  expectedStatus: readonly number[];
  timeoutMs: number;
}

/**
 * Thresholds of the OK -> DEGRADED -> DOWN state machine. Consecutive counters give
 * hysteresis, so a single lost packet neither pages anyone nor closes an incident.
 */
export interface HealthPolicy {
  /** A response with expected status but slower than this is classified as `slow`. */
  degradedLatencyMs: number;
  /** Consecutive `fail` outcomes needed to reach DOWN. */
  failureThreshold: number;
  /** Consecutive `up` outcomes needed to return to OK and resolve the incident. */
  recoveryThreshold: number;
}

export interface Monitor {
  id: MonitorId;
  ownerId: UserId;
  name: string;
  target: ProbeTarget;
  intervalSeconds: number;
  policy: HealthPolicy;
  paused: boolean;
  createdAt: Date;
  updatedAt: Date;
}
