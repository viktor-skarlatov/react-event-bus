import { useCallback, useContext, useEffect, useRef } from 'react';

import { EventBusContext } from '../contexts';
import {
  EventSubscription,
  OptionalParameters,
  SubscriptionData,
} from '../contracts';

interface Props<S> {
  eventSubscriptions?: EventSubscription<S>;
  autoSubscribe?: boolean;
}

export function useEventBus<S>(props?: Props<S>) {
  const subscriptions = props?.eventSubscriptions;
  const context = useContext(EventBusContext);
  const currentSubsRef = useRef<SubscriptionData[]>();

  const subscribe = useCallback(() => {
    if (!context || !subscriptions) {
      return;
    }

    const subscriptionsData: SubscriptionData[] = [];
    Object.keys(subscriptions).forEach((eventName) => {
      const key = eventName as keyof S;
      const eventHandler = subscriptions[key];
      if (!eventHandler) {
        return;
      }

      const id = context.subscribe(eventName, eventHandler);

      subscriptionsData.push({
        eventName,
        id,
      });
    });

    currentSubsRef.current = subscriptionsData;

    return subscriptionsData;
  }, [context, subscriptions]);

  const unsubscribeInternal = useCallback(
    (subsData: SubscriptionData[] | undefined) => {
      subsData?.forEach(({ id, eventName }) =>
        context?.unsubscribe(eventName, id),
      );

      currentSubsRef.current = undefined;
    },
    [context],
  );

  useEffect(() => {
    let subsData: SubscriptionData[] | undefined;
    if (props?.autoSubscribe !== false) {
      subsData = subscribe();
    }

    return () => {
      unsubscribeInternal(subsData);
    };
  }, [props?.autoSubscribe, subscribe, unsubscribeInternal]);

  const raiseEvent = useCallback(
    <N extends keyof S>(
      eventName: N,
      ...args: OptionalParameters<EventSubscription<S>[N]>
    ) => {
      context?.raiseEvent(eventName, ...args);
    },
    [context],
  );

  const unsubscribe = useCallback(() => {
    unsubscribeInternal(currentSubsRef.current);
  }, [unsubscribeInternal]);

  return {
    raiseEvent,
    subscribe,
    unsubscribe,
  };
}
