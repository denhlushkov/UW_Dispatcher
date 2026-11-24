import type { Brand } from '../../../shared/brand.js';
import type { ChannelId } from '../../catalog/index.js';
import type { IncidentEventId } from '../../incident-engine/index.js';

export type DeliveryId = Brand<string, 'DeliveryId'>;

/**
 * Lifecycle of one (incident event x channel) delivery. Guarantee: at-least-once,
 * deduplicated by `idempotencyKey` (see adr/0003).
 */
export const DELIVERY_STATUSES = [
  'pending',
  'in_flight',
  'retry_scheduled',
  'delivered',
  'dead',
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface Delivery {
  id: DeliveryId;
  incidentEventId: IncidentEventId;
  channelId: ChannelId;
  /** Deterministic `${incidentEventId}:${channelId}`; identical across retries. */
  idempotencyKey: string;
  status: DeliveryStatus;
  attempts: number;
  nextAttemptAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  deliveredAt: Date | null;
}

/** Exponential backoff with full jitter, capped; exhausted attempts => `dead`. */
export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}
