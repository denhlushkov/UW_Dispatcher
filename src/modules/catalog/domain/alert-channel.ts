import type { Brand } from '../../../shared/brand.js';
import type { MonitorId, UserId } from './monitor.js';

export type ChannelId = Brand<string, 'ChannelId'>;

export const SEVERITIES = ['degraded', 'down'] as const;
export type Severity = (typeof SEVERITIES)[number];

/** Channel-specific settings. Secrets (bot tokens, SMTP credentials) live in env, not here. */
export type ChannelConfig =
  | { kind: 'telegram'; chatId: string }
  | { kind: 'email'; to: string }
  | { kind: 'webhook'; url: string; signingSecret: string };

export type ChannelKind = ChannelConfig['kind'];

export interface AlertChannel {
  id: ChannelId;
  ownerId: UserId;
  name: string;
  config: ChannelConfig;
  createdAt: Date;
}

/** Monitor <-> channel link: which incidents of a monitor are routed to which channel. */
export interface Subscription {
  monitorId: MonitorId;
  channelId: ChannelId;
  minSeverity: Severity;
}
