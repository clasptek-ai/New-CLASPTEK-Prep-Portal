import React, { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';

export default {
  title: 'Navigation/Tabs',
  component: Tabs,
};

export const Default = () => {
  const [tab, setTab] = useState('overview');
  return (
    <Tabs activeTab={tab} onTabChange={setTab}>
      <TabList>
        <Tab id="overview" label="Overview" />
        <Tab id="analytics" label="Analytics" />
      </TabList>
      <TabPanel id="overview">Overview View</TabPanel>
      <TabPanel id="analytics">Analytics View</TabPanel>
    </Tabs>
  );
};
