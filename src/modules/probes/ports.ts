import type { CheckResult } from './domain/check-result.js';

/**
 * Output port of probes. The composition root plugs incident-engine in here, which keeps
 * the dependency arrow pointing upstream (incident-engine -> probes, never the reverse).
 */
export type CheckResultHandler = (result: CheckResult) => Promise<void>;
