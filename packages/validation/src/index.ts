/**
 * @service Validation
 * Global validation primitives and format definitions
 */

import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255);

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(100);

export const idSchema = z.string().uuid('ID must be a valid UUIDv4');

export const registrationInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export type RegistrationInput = z.infer<typeof registrationInputSchema>;
