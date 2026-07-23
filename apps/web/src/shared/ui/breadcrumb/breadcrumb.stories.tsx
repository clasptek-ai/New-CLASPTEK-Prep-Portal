import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export default {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
};

export const Default = () => (
  <Breadcrumb>
    <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
    <BreadcrumbItem href="/student">Student Workspace</BreadcrumbItem>
    <BreadcrumbItem isCurrent>Assessments</BreadcrumbItem>
  </Breadcrumb>
);
