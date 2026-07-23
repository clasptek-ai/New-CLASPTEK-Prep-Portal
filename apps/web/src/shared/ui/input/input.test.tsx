import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, PasswordInput, SearchInput } from './Input';

describe('Input Component (Wave 002B)', () => {
  it('renders input with label and helper text', () => {
    render(<Input label="Username" helperText="Enter your unique handle" />);
    expect(screen.getByLabelText('Username')).toBeDefined();
    expect(screen.getByText('Enter your unique handle')).toBeDefined();
  });

  it('renders validation error message and sets aria-invalid', () => {
    render(<Input label="Email" error="Email is required" />);
    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Email is required');
  });

  it('toggles password visibility in PasswordInput', () => {
    render(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password');
    const toggleBtn = screen.getByRole('button', { name: 'Show password' });
    expect(input.getAttribute('type')).toBe('password');
    fireEvent.click(toggleBtn);
    expect(input.getAttribute('type')).toBe('text');
  });

  it('renders SearchInput with search icon', () => {
    render(<SearchInput placeholder="Search catalog..." />);
    expect(screen.getByPlaceholderText('Search catalog...')).toBeDefined();
  });

  it('handles value changes and ref forwarding', () => {
    const handleChange = vi.fn();
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} label="Test" onChange={handleChange} />);
    const input = screen.getByLabelText('Test');
    fireEvent.change(input, { target: { value: 'New Value' } });
    expect(handleChange).toHaveBeenCalled();
    expect(ref.current).toBe(input);
  });
});
