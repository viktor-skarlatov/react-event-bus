import React, { useCallback, useMemo, useState } from 'react';

import { EventSubscription } from '../src/contracts';
import { useEventBus } from '../src/hooks';
import { TestEvents } from './types';

interface ComponentProps<T> {
  eventSubscriptions: T;
}
export function Component<T>({
  eventSubscriptions,
}: ComponentProps<EventSubscription<T>>) {
  useEventBus<T>({ eventSubscriptions });
  return null;
}

export function Consumer() {
  const [text, setText] = useState('');

  const onTestEvent = useCallback((value: number) => {
    setText(`event fired - ${value}`);
  }, []);

  const subs: TestEvents = useMemo(
    () => ({
      'test-event': onTestEvent,
    }),
    [onTestEvent],
  );

  useEventBus<TestEvents>({ eventSubscriptions: subs });

  return <div data-testid="consumer-text">{text}</div>;
}

interface ProducerProps {
  value: number;
}
export function Producer({ value }: ProducerProps) {
  const { raiseEvent } = useEventBus<TestEvents>();

  const onRaiseEvent = useCallback(() => {
    raiseEvent('test-event', value);
  }, [raiseEvent, value]);

  return <button data-testid="producer-button" onClick={onRaiseEvent} />;
}
