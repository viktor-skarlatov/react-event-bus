import { EventBusState } from '../src/contexts';
import {
  createWarningMessage,
  globalEventBus,
  setGlobalEventBusRef,
} from '../src/utils';
import { eventName } from './constants';
import { TestEvents } from './types';

const warnMock = jest.spyOn(global.console, 'warn');

const { raiseEvent } = globalEventBus<TestEvents>();

const testEventBus: EventBusState = {
  raiseEvent: jest.fn(),
} as any;

describe('utils', () => {
  test('raiseEvent before it is initialized', () => {
    raiseEvent(eventName, 5);
    expect(warnMock).toHaveBeenCalledWith(createWarningMessage(eventName));
  });

  test('raiseEvent when it is properly initialized', () => {
    setGlobalEventBusRef(testEventBus);
    raiseEvent(eventName, 5);
    expect(testEventBus.raiseEvent).toHaveBeenCalledWith(eventName, 5);
  });
});
