import React from 'react';

export interface WidgetProps {
  title: string;
  metricCode?: string;
  data?: any;
  config?: Record<string, any>;
}

export type WidgetComponent = React.ComponentType<WidgetProps>;

class ClientWidgetRegistry {
  private registry: Map<string, WidgetComponent> = new Map();

  public register(type: string, component: WidgetComponent): void {
    this.registry.set(type, component);
  }

  public get(type: string): WidgetComponent | undefined {
    return this.registry.get(type);
  }

  public listTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const clientWidgetRegistry = new ClientWidgetRegistry();
