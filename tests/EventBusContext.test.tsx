import '@testing-library/jest-dom';

import { fireEvent, screen } from '@testing-library/react';
import { uniqueId } from 'lodash';
import React from 'react';

import { EventBusProvider, EventBusProviderProps } from '../src/contexts';
import {
  globalEventBus,
  globalEventBusContext,
  setGlobalEventBusRef,
} from '../src/utils';
import { Component, Consumer, Producer } from './components';
import { eventName, eventName2 } from './constants';
import { render } from './TestApp';
import { TestEvents, TestEvents2 } from './types';

const defaultContextProps: EventBusProviderProps = {
  contextCreated: setGlobalEventBusRef,
  createUniqueId: uniqueId,
};

const subs1: TestEvents = {
  'test-event': () => undefined,
};

const subs2: TestEvents2 = {
  'test-event-2': () => undefined,
};

const subId = 'test-id';
const createUniqueIdMock = jest.fn().mockReturnValue(subId);

describe('EventBusContext', () => {
  test('contextCreated', () => {
    render(
      <EventBusProvider
        contextCreated={setGlobalEventBusRef}
        createUniqueId={uniqueId}
      />,
    );
    const eventBus = globalEventBus();
    expect(eventBus).toBeDefined();
  });

  test('createUniqueId', () => {
    const contextProps: EventBusProviderProps = {
      ...defaultContextProps,
      createUniqueId: createUniqueIdMock,
    };

    render(<Component eventSubscriptions={subs1} />, { contextProps });

    expect(
      Object.keys(globalEventBusContext.subscriptions[eventName]).length,
    ).toBe(1);
    expect(globalEventBusContext.subscriptions[eventName][subId]).toBe(
      subs1['test-event'],
    );
  });

  test('mount and unmount', () => {
    const { unmount } = render(
      <>
        <Component eventSubscriptions={subs1} />
        <Component eventSubscriptions={subs1} />

        <Component eventSubscriptions={subs2} />
      </>,
      { contextProps: defaultContextProps },
    );

    expect(
      Object.keys(globalEventBusContext.subscriptions[eventName]).length,
    ).toBe(2);
    expect(
      Object.keys(globalEventBusContext.subscriptions[eventName2]).length,
    ).toBe(1);
    expect(globalEventBusContext.subscriptions[eventName][1]).toBe(
      subs1['test-event'],
    );
    expect(globalEventBusContext.subscriptions[eventName][2]).toBe(
      subs1['test-event'],
    );
    expect(globalEventBusContext.subscriptions[eventName2][3]).toBe(
      subs2['test-event-2'],
    );

    unmount();

    expect(globalEventBusContext.subscriptions[eventName]).toBeUndefined();
    expect(globalEventBusContext.subscriptions[eventName2]).toBeUndefined();
  });

  test('raise event', () => {
    const eventValue = 5;
    render(
      <>
        <Consumer />
        <Producer value={eventValue} />
      </>,
      { contextProps: defaultContextProps },
    );

    const loginButton = screen.getByTestId('producer-button');
    fireEvent.click(loginButton);
    expect(screen.getByTestId('consumer-text')).toHaveTextContent(
      `event fired - ${eventValue}`,
    );
  });
});
