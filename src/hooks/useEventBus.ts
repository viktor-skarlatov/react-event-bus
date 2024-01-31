import { useCallback, useContext, useEffect } from 'react';

import { EventBusContext } from '../contexts';
import {
  EventSubscription,
  OptionalParameters,
  SubscriptionData,
} from '../contracts';

interface Props<S> {
  eventSubscriptions?: EventSubscription<S>;
}

export function useEventBus<S>(props?: Props<S>) {
  const subscriptions = props?.eventSubscriptions;
  const context = useContext(EventBusContext);

  useEffect(() => {
    if (!context || !subscriptions) {
      return;
    }

    const { subscribe, unsubscribe } = context;

    const subscriptionsData: SubscriptionData[] = [];
    Object.keys(subscriptions).forEach((eventName) => {
      const key = eventName as keyof S;
      const eventHandler = subscriptions[key];
      if (!eventHandler) {
        return;
      }

      const id = subscribe(eventName, eventHandler);

      subscriptionsData.push({
        eventName,
        id,
      });
    });

    return () => {
      subscriptionsData.forEach(({ id, eventName }) =>
        unsubscribe(eventName, id),
      );
    };
  }, [subscriptions, context]);

  const raiseEvent = useCallback(
    <N extends keyof S>(
      eventName: N,
      ...args: OptionalParameters<EventSubscription<S>[N]>
    ) => {
      context?.raiseEvent(eventName, ...args);
    },
    [context],
  );

  return {
    raiseEvent,
  };
}
