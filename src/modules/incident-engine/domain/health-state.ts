import type { Brand } from '../../../shared/brand.js';
import type { MonitorId, Severity } from '../../catalog/index.js';

export type IncidentId = Brand<string, 'IncidentId'>;
export type IncidentEventId = Brand<string, 'IncidentEventId'>;

export const HEALTH_STATES = ['UNKNOWN', 'OK', 'DEGRADED', 'DOWN'] as const;
export type HealthState = (typeof HEALTH_STATES)[number];

/** Per-monitor state machine memory, persisted next to the monitor. */
export interface MonitorHealth {
  state: HealthState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

/**
 * Facts emitted on state transitions. They are the outbox that notifications consume:
 * - `opened`    — OK/UNKNOWN -> DEGRADED | DOWN;
 * - `escalated` — DEGRADED -> DOWN;
 * - `resolved`  — DEGRADED | DOWN -> OK.
 */
export const INCIDENT_EVENT_KINDS = ['opened', 'escalated', 'resolved'] as const;
export type IncidentEventKind = (typeof INCIDENT_EVENT_KINDS)[number];

export interface IncidentEvent {
  id: IncidentEventId;
  incidentId: IncidentId;
  monitorId: MonitorId;
  kind: IncidentEventKind;
  severity: Severity;
  occurredAt: Date;
}
