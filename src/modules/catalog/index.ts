/**
 * catalog — configuration owned by users: monitors, alert channels and subscriptions.
 * Upstream of every other module; depends on nothing but shared/platform.
 */
export type {
  HealthPolicy,
  HttpMethod,
  Monitor,
  MonitorId,
  ProbeTarget,
  UserId,
} from './domain/monitor.js';
export { HTTP_METHODS } from './domain/monitor.js';
export type {
  AlertChannel,
  ChannelConfig,
  ChannelId,
  ChannelKind,
  Severity,
  Subscription,
} from './domain/alert-channel.js';
export { SEVERITIES } from './domain/alert-channel.js';
export type { MonitorChanged, MonitorChangedHandler } from './ports.js';
