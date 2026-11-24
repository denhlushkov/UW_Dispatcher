/**
 * incident-engine — consumes CheckResult, runs the OK -> DEGRADED -> DOWN state machine,
 * opens/escalates/resolves incidents and records IncidentEvent facts (outbox).
 */
export type {
  HealthState,
  IncidentEvent,
  IncidentEventId,
  IncidentEventKind,
  IncidentId,
  MonitorHealth,
} from './domain/health-state.js';
export { HEALTH_STATES, INCIDENT_EVENT_KINDS } from './domain/health-state.js';
