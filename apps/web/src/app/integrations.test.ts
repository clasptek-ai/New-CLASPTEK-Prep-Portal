import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/admin/integrations',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn(),
    }),
    use: (promise: any) => {
      return { connectionId: 'c1' };
    },
  };
});

vi.mock('../providers/theme-provider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'dark',
      setTheme: vi.fn(),
    }),
  };
});

import {
  IntegrationCard,
  ConnectionStatus,
  ConnectionWizard,
} from '../components/integrations/integration-components';
import { IntegrationsScreen } from '../features/admin/integrations/integrations-screen';
import { ConnectionWorkspace } from '../features/admin/integrations/connection-workspace';
import { WebhooksScreen } from '../features/admin/integrations/webhooks-screen';
import { AutomationScreen } from '../features/admin/integrations/automation-screen';

describe('Integrations & Automation Platform compilation validation', () => {
  test('Components and feature screen wrappers are defined and compile', () => {
    expect(IntegrationCard).toBeDefined();
    expect(ConnectionStatus).toBeDefined();
    expect(ConnectionWizard).toBeDefined();
    expect(IntegrationsScreen).toBeDefined();
    expect(ConnectionWorkspace).toBeDefined();
    expect(WebhooksScreen).toBeDefined();
    expect(AutomationScreen).toBeDefined();
  });
});
