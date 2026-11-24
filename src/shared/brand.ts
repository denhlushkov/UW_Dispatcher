declare const brand: unique symbol;

/**
 * Nominal typing for identifiers: a MonitorId cannot be passed where a ChannelId is
 * expected even though both are strings at runtime.
 */
export type Brand<T, Name extends string> = T & { readonly [brand]: Name };
