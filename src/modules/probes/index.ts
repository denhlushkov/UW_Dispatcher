/**
 * probes — scheduled HTTP checks of monitor targets. Produces CheckResult and hands it
 * to a downstream handler; it never knows about incidents or notifications.
 */
export type { CheckOutcome, CheckResult, ProbeErrorCode } from './domain/check-result.js';
export { CHECK_OUTCOMES, PROBE_ERROR_CODES } from './domain/check-result.js';
export type { CheckResultHandler } from './ports.js';
