'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function GroupsScreen() {
  return (
    <Card title="Departments & Groups Assignation">
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
        Group students or instructors into class departments or administrative units.
      </p>
    </Card>
  );
}
export default GroupsScreen;
