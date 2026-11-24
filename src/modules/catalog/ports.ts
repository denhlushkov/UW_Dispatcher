import type { MonitorId } from './domain/monitor.js';

/** Published after a monitor's schedule-relevant config is committed (spec SC-02, SC-06). */
export interface MonitorChanged {
  monitorId: MonitorId;
  intervalSeconds: number;
  /** `true` when paused or deleted: probes must drop the schedule. */
  inactive: boolean;
}

/**
 * Output port of catalog. app/ wires probes (reschedule) and incident-engine (close open
 * incident on pause/delete) here, so catalog stays upstream of the pipeline.
 */
export type MonitorChangedHandler = (event: MonitorChanged) => Promise<void>;
