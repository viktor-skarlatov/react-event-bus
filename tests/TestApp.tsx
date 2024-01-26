import React, { PropsWithChildren, ReactNode } from "react";
import { render as testRender } from '@testing-library/react';
import { uniqueId } from "lodash";
import { EventBusProvider, EventBusProviderProps } from "../src/contexts";

interface TestAppProps extends PropsWithChildren {
  contextProps?: EventBusProviderProps;
}

function TestApp({ children, contextProps }: TestAppProps) {
  return (
    <EventBusProvider {...(contextProps ?? { createUniqueId: uniqueId })}>
      {children}
    </EventBusProvider>
  );
}

export function render(children: ReactNode, props?: TestAppProps) {
  return testRender(
    <TestApp {...props}>
      {children}
    </TestApp>
  );
}
