import React from 'react';
import { SidebarItem } from './SidebarItem';
import { TopNavigation } from './TopNavigation';

export default {
  title: 'Navigation/EnterpriseNavigation',
  component: TopNavigation,
};

export const Header = () => <TopNavigation logo={<h2>Clasptek</h2>} />;
export const Sidebar = () => <SidebarItem href="/dashboard" label="Dashboard" isActive />;
