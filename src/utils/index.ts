import { EventBusState } from "../contexts";
import { EventSubscription, OptionalParameters } from "../contracts";

export let globalEventBusContext: EventBusState;

export function setGlobalEventBusRef(context: EventBusState) {
  globalEventBusContext = context;
}

export const createWarningMessage = (eventName: string | number | symbol) => `Attempting to raise the ${String(eventName)} event before the global event bus ref is initialized.`;

export function globalEventBus<S extends EventSubscription<S>>() {
  const raiseEvent = <N extends keyof S>(
    eventName: N,
    ...args: OptionalParameters<EventSubscription<S>[N]>
  ) => {
    if (globalEventBusContext === undefined) {
      console.warn(createWarningMessage(eventName));
      return;
    }
  
    globalEventBusContext.raiseEvent(eventName, ...args);
  };

  return {
    raiseEvent,
  };
}
