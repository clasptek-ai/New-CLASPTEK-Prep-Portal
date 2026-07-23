import React from 'react';
import { Button } from './Button';

export default {
  title: 'Foundation/Button',
  component: Button,
};

export const Primary = () => <Button variant="primary">Primary Action</Button>;
export const Secondary = () => <Button variant="secondary">Secondary Action</Button>;
export const Danger = () => <Button variant="danger">Delete Item</Button>;
export const Loading = () => <Button isLoading>Saving Changes</Button>;
