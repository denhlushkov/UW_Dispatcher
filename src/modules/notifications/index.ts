/**
 * notifications — turns IncidentEvent facts into deliveries per subscribed channel and
 * sends them (Telegram / Email / Webhook) with retries, backoff and idempotency keys.
 */
export type { Delivery, DeliveryId, DeliveryStatus, RetryPolicy } from './domain/delivery.js';
export { DELIVERY_STATUSES } from './domain/delivery.js';
