import { describe, test, expect, vi } from 'vitest';
import React from 'react';

vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/admin/observability',
    useRouter: () => ({
      push: vi.fn(),
      prefetch: vi.fn()
    }),
    use: (promise: any) => {
      return { incidentId: 'i1' };
    }
  };
});

vi.mock('../providers/theme-provider', () => {
  return {
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
      theme: 'dark',
      setTheme: vi.fn()
    })
  };
});

import { MetricCard, AlertCard, ServiceDependencyGraph, TraceSpanNode } from '../components/admin/observability/observability-components';
import { OperationsDashboardScreen } from '../features/admin/observability/dashboard';
import { MetricsExplorerScreen } from '../features/admin/observability/metrics-explorer';
import { TracesViewScreen } from '../features/admin/observability/traces-view';
import { AlertCenterScreen } from '../features/admin/observability/alert-center';
import { IncidentWorkspace } from '../features/admin/observability/incident-workspace';

describe('Observability & Operational Intelligence Platform compilation validation', () => {
  test('Components and feature screen wrappers are defined and compile', () => {
    expect(MetricCard).toBeDefined();
    expect(AlertCard).toBeDefined();
    expect(ServiceDependencyGraph).toBeDefined();
    expect(TraceSpanNode).toBeDefined();
    expect(OperationsDashboardScreen).toBeDefined();
    expect(MetricsExplorerScreen).toBeDefined();
    expect(TracesViewScreen).toBeDefined();
    expect(AlertCenterScreen).toBeDefined();
    expect(IncidentWorkspace).toBeDefined();
  });
});
