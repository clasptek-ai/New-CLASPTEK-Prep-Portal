import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Clasptek Prep Portal V2',
  description: 'Phase 1 Project Foundation Platform Shell',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell-container">{children}</div>
      </body>
    </html>
  );
}
