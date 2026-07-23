import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';

function TestTabsComponent() {
  const [activeTab, setActiveTab] = useState('tab1');
  return (
    <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
      <TabList>
        <Tab id="tab1" label="Overview" />
        <Tab id="tab2" label="Analytics" />
      </TabList>
      <TabPanel id="tab1">Overview Panel Content</TabPanel>
      <TabPanel id="tab2">Analytics Panel Content</TabPanel>
    </Tabs>
  );
}

describe('Tabs Component (Wave 002C)', () => {
  it('renders tablist and active panel content', () => {
    render(<TestTabsComponent />);
    expect(screen.getByRole('tablist')).toBeDefined();
    expect(screen.getByText('Overview Panel Content')).toBeDefined();
  });

  it('switches active tab and updates tabpanel visibility', () => {
    render(<TestTabsComponent />);
    const analyticsTab = screen.getByRole('tab', { name: 'Analytics' });
    fireEvent.click(analyticsTab);
    expect(screen.getByText('Analytics Panel Content')).toBeDefined();
    expect(screen.queryByText('Overview Panel Content')).toBeNull();
  });
});
