import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { EventHandler, EventKey, EventTable } from '../contracts';

export interface EventBusState {
  subscribe: (event: EventKey, handler: EventHandler) => string;
  unsubscribe: (event: EventKey, id: string) => void;
  raiseEvent: (event: EventKey, ...args: any[]) => void;
  subscriptions: EventTable;
}

export const EventBusContext = createContext<EventBusState | undefined>(
  undefined,
);

export interface EventBusProviderProps {
  contextCreated?: (context: EventBusState) => void;
  createUniqueId: () => string;
}

export const EventBusProvider = ({
  children,
  createUniqueId,
  contextCreated,
}: PropsWithChildren<EventBusProviderProps>) => {
  const [subscriptions] = useState<EventTable>({});

  const subscribe: EventBusState['subscribe'] = useCallback(
    (name, handler) => {
      let subscribers = subscriptions[name];
      if (!subscribers) {
        subscribers = {};
        subscriptions[name] = subscribers;
      }

      const id = createUniqueId();
      subscribers[id] = handler;

      return id;
    },
    [subscriptions, createUniqueId],
  );

  const unsubscribe: EventBusState['unsubscribe'] = useCallback(
    (eventName, id) => {
      const subscribers = subscriptions[eventName];
      if (!subscribers) {
        return;
      }

      delete subscribers[id];

      if (Object.keys(subscribers).length === 0) {
        delete subscriptions[eventName];
      }
    },
    [subscriptions],
  );

  const raiseEvent: EventBusState['raiseEvent'] = useCallback(
    (eventName, args) => {
      const eventSubscribers = subscriptions[eventName];
      if (!eventSubscribers) {
        return;
      }

      Object.values(eventSubscribers).forEach((eventHandler) => {
        eventHandler?.(args);
      });
    },
    [subscriptions],
  );

  const context = useMemo(() => {
    const contextObject: EventBusState = {
      raiseEvent,
      subscribe,
      unsubscribe,
      subscriptions,
    };
    contextCreated?.(contextObject);
    return contextObject;
  }, [subscriptions, raiseEvent, subscribe, unsubscribe, contextCreated]);

  return (
    <EventBusContext.Provider value={context}>
      {children}
    </EventBusContext.Provider>
  );
};
