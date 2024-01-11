import { useCallback, useContext, useEffect } from "react";
import { EventSubscription, OptionalParameters, SubscriptionData } from "../contracts";
import { EventBusContext } from "../contexts";

export function useEventBus<S>(subscriptions?: EventSubscription<S>) {
  const context = useContext(EventBusContext);

  useEffect(() => {
    if (!context || !subscriptions) {
      return;
    }

    const {subscribe, unsubscribe} = context;

    const subscriptionsData: SubscriptionData[] = [];
    Object.keys(subscriptions).forEach(eventName => {
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
      subscriptionsData.forEach(({id, eventName}) =>
        unsubscribe(eventName, id),
      );
    };
  }, [subscriptions, context]);

  const raiseEvent = useCallback(
    (
      eventName: keyof S,
      ...args: OptionalParameters<EventSubscription<S>[keyof S]>
    ) => {
      // @ts-ignore
      context?.raiseEvent(eventName, ...(args ?? []));
    },
    [context],
  );

  return {
    raiseEvent,
  };
}
