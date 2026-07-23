import React from 'react';
import { AdminWorkspaceProvider } from '../../workspace/AdminWorkspaceContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminWorkspaceProvider>{children}</AdminWorkspaceProvider>;
}
