export type EventHandler = (...args: any[]) => void;
export type EventSubscriberTable = Record<string, EventHandler>;
export type EventKey = string | number | symbol;
export type EventTable = Record<EventKey, EventSubscriberTable>;
export type EventSubscription<T> = {
  [K in keyof T]: T[K] extends EventHandler | undefined ? T[K] : never;
};
export type OptionalParameters<T> = T extends EventHandler | undefined
  ? T extends EventHandler
    ? Parameters<T>
    : never
  : never;
export interface SubscriptionData {
  id: string;
  eventName: string;
}
