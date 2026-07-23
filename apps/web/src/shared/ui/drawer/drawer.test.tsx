import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer Component (Wave 002D)', () => {
  it('renders drawer with aria-modal="true" when open', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Navigation Settings">
        Drawer Body Content
      </Drawer>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Navigation Settings')).toBeDefined();
  });
});
