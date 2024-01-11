# React Event Bus :zap: <img src="assets/icons/react.svg" alt="drawing" style="margin-bottom: -6px;" width="27" height="27"/>

## Description
This package is an implementation of the [event](https://en.wikipedia.org/wiki/Event-driven_architecture) pattern. It allows direct, decoupled communication between entities (components, stores, actions etc.) in [React](https://react.dev) or [React Native](https://reactnative.dev) applications.

## Motivation
Using events makes it easier for components to react to changes without indirectly using central state or props with *useEffect*. This is a very common source of performance issues and other bugs in React apps.

## Drawbacks
Relying too heavily on events for state management can result in code that is hard to follow especially in pure Javascript projects. Also beware of *event storms* (unintended cascade of events or infinite event loops).

## Installation

Using **npm**
```
npm i @skarlatov/react-event-bus
```

Using **yarn**
```
yarn add @skarlatov/react-event-bus
```

## Basic usage :pizza:

    
### 1. Context setup
```
import { uniqueId } from "lodash";
import { EventBusProvider } from "@skarlatov/react-event-bus";

export function App() {
  /*
    The provider needs a function that creates unique ids to keep
    track of its subscriptions internally. The function is passed
    as a prop so that the event bus library doesn't have any other
    dependencies except React.
  */
  return (
    <EventBusProvider createUniqueId={uniqueId}>
      {/* The rest of your root app code is here */}
    </EventBusProvider>
  );
}
```

### 2. Define events contract
```
export interface PizzaEvents {
  "pizza-ordered": (pizzaName: string) => void;
}
```

### 3. Event emitter
```
import React, { useCallback } from "react";
import { useEventBus } from "@skarlatov/react-event-bus";
import { PizzaEvents } from "./contracts";

export function PizzeriaWaiter() {
  const { raiseEvent } = useEventBus<PizzaEvents>();

  const onOrderPizza = useCallback(() => {
    raiseEvent("pizza-ordered", "New York");
  }, [raiseEvent]);

  return (
    <div>
      <div>Pizzeria Waiter</div>
      <button onClick={onOrderPizza}>Order pizza!</button>
    </div>
  );
}
```

### 4. Event consumer
```
import React, { useCallback } from "react";
import { useEventBus } from "@skarlatov/react-event-bus";
import { PizzaEvents } from "./contracts";

export function PizzeriaKitchen() {
  const onPizzaOrdered = useCallback((name: string) => {
    console.log(`We have a new pizza ${name} to make! Chop chop!`)
  }, []);

  // It is very important that the eventSubscriptions object
  // has a stable reference. Otherwise the event bus will
  // subscribe and unsubscribe from the event on every render.
  const eventSubscriptions: PizzaEvents = useMemo(() => ({
    "pizza-ordered": onPizzaOrdered,
  }), [onPizzaOrdered]);

  useEventBus<PizzaEvents>(eventSubscriptions);

  return (
    <div>
      Pizzeria Kitchen
    </div>
  );
}
```