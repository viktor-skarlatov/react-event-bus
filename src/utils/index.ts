import { EventBusState } from "../contexts";
import { EventSubscription, OptionalParameters } from "../contracts";

let globalEventBusContext: EventBusState;

export function setGlobalEventBusRef(context: EventBusState) {
  globalEventBusContext = context;
}

export function raiseEvent<S extends EventSubscription<S>>(
  eventName: keyof S,
  ...args: OptionalParameters<EventSubscription<S>[keyof S]>
) {
  if (globalEventBusContext === undefined) {
    console.warn(`Attempting to raise the ${String(eventName)} event before the global event bus ref is initialized.`);
    return;
  }

  // @ts-ignore
  globalEventBusContext.raiseEvent(eventName, ...(args ?? []));
}
