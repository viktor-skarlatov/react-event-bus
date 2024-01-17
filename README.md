# React Event Bus :zap: <img src="https://raw.githubusercontent.com/viktor-skarlatov/react-event-bus/main/assets/icons/react.svg" alt="drawing" style="margin-bottom: -6px;" width="27" height="27"/>

## Description
This package is an implementation of the [event](https://en.wikipedia.org/wiki/Event-driven_architecture) pattern. It allows direct, decoupled communication between entities (components, stores, actions etc.) in [React](https://react.dev) or [React Native](https://reactnative.dev) applications.

## Motivation
Using events makes it easier for components to react to changes without indirectly using central state or props with [*useEffect*](https://react.dev/reference/react/useEffect). This is a very common source of performance issues and other bugs in React apps.

## Drawbacks
Relying too heavily on events for state management can result in code that is hard to follow especially in pure Javascript projects. Also beware of *event storms* (unintended cascade of events or infinite event loops).

## Installation

Using **npm**
```bash
npm i @skarlatov/react-event-bus
```

Using **yarn**
```bash
yarn add @skarlatov/react-event-bus
```

## Basic usage :pizza:

    
### 1. Context setup
```js
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

### 2. Events contract
```js
export interface PizzaEvents {
  "pizza-ordered"?: (pizzaName: string) => void;
}
```

### 3. Event emitter
```js
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
```js
import React, { useCallback, useMemo } from "react";
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

  useEventBus<PizzaEvents>({ eventSubscriptions });

  return (
    <div>
      Pizzeria Kitchen
    </div>
  );
}
```

## Usage outside React components
The event bus can be accessed outside React components by using the *setGlobalEventBusRef* utility function and the *contextCreated* prop of the provider.

```js
import { uniqueId } from "lodash";
import { EventBusProvider, setGlobalEventBusRef } from "@skarlatov/react-event-bus";

export function App() {
  return (
    <EventBusProvider 
      contextCreated={setGlobalEventBusRef}
      createUniqueId={uniqueId}>
      {/* The rest of your root app code is here */}
    </EventBusProvider>
  );
}
```

The global reference can be used to raise events from anywhere including stores and actions with the *raiseEvent* utility function. This function is safe in the sense that if the global ref is not initialized yet your app will not crash. Just the event won't be raised and a warning will be printed in the console.

For the sake of the example we update our PizzaEvents contract with a new 'pizza-ready' event.

```js
export interface PizzaEvents {
  "pizza-ordered"?: (pizzaName: string) => void;
  // The new event
  "pizza-ready"?: (pizzaName: string) => void;
}
```

Now we can raise the event **without** the *useEventBus* hook like so:

```js
import { useCallback } from 'react';
import { globalEventBus } from "@skarlatov/react-event-bus";
import { PizzaEvents } from "./contracts";

const { raiseEvent } = globalEventBus<PizzaEvents>();

export function PizzeriaKitchen() {
  const onPizzaReady = useCallback((name: string) => {
    raiseEvent("pizza-ready", name);
  }, []);

  return (
    <div>
      Pizzeria Kitchen
      <button onClick={() => onPizzaReady("New York")}>Pizza ready!</button>
    </div>
  );
}
```