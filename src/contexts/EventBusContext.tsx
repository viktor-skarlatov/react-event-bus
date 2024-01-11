import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  EventHandler,
  EventTable,
  SubscriptionId,
} from "../contracts";

export interface EventBusState {
  subscribe: (event: string, handler: EventHandler) => SubscriptionId;
  unsubscribe: (event: string, id: SubscriptionId) => void;
  raiseEvent: (event: string, ...args: any) => void;
}

export const EventBusContext = createContext<EventBusState | undefined>(
  undefined,
);

interface Props {
  contextCreated?: (context: EventBusState) => void;
  createUniqueId: () => string;
}

export const EventBusProvider = ({
  children,
  createUniqueId,
  contextCreated,
}: PropsWithChildren<Props>) => {
  const [subscriptions] = useState<EventTable>({});

  const subscribe: EventBusState["subscribe"] = useCallback(
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

  const unsubscribe: EventBusState["unsubscribe"] = useCallback(
    (eventName, id) => {
      const subscribers = subscriptions[eventName];
      if (!subscribers) {
        return;
      }

      delete subscribers[id];
    },
    [subscriptions],
  );

  const raiseEvent: EventBusState["raiseEvent"] = useCallback(
    (eventName, args) => {
      const eventSubscribers = subscriptions[eventName];
      if (!eventSubscribers) {
        return;
      }

      Object.values(eventSubscribers).forEach(eventHandler => {
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
    };
    contextCreated?.(contextObject);
    return contextObject;
  }, [raiseEvent, subscribe, unsubscribe, contextCreated]);

  return (
    <EventBusContext.Provider value={context}>
      {children}
    </EventBusContext.Provider>
  );
};