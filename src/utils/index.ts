import { EventBusState } from "contexts";
import { EventSubscription, OptionalParameters } from "contracts";

let globalEventBusContext: EventBusState;

export function setGlobalEventBusRef(context: EventBusState) {
  globalEventBusContext = context;
}

export function raiseEvent<S extends EventSubscription<S>>(
  eventName: keyof S,
  ...args: OptionalParameters<EventSubscription<S>[keyof S]>
) {
  // @ts-ignore
  globalEventBusContext?.raiseEvent(eventName, ...(args ?? []));
}
