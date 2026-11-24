import type { MonitorId } from '../../catalog/index.js';

/**
 * Classification of one probe:
 * - `up`   — expected status within `degradedLatencyMs`;
 * - `slow` — expected status, but slower than `degradedLatencyMs`;
 * - `fail` — timeout, network/TLS error or unexpected status.
 */
export const CHECK_OUTCOMES = ['up', 'slow', 'fail'] as const;
export type CheckOutcome = (typeof CHECK_OUTCOMES)[number];

export const PROBE_ERROR_CODES = [
  'TIMEOUT',
  'DNS',
  'CONNECTION',
  'TLS',
  'UNEXPECTED_STATUS',
] as const;
export type ProbeErrorCode = (typeof PROBE_ERROR_CODES)[number];

export interface CheckResult {
  monitorId: MonitorId;
  checkedAt: Date;
  outcome: CheckOutcome;
  latencyMs: number | null;
  httpStatus: number | null;
  errorCode: ProbeErrorCode | null;
}
