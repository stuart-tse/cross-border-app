import { z } from 'zod';
import { USER_TYPES } from '@/lib/constants';

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    // International phone number format
    return /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s\-\(\)]/g, ''));
  }, 'Please enter a valid phone number');

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  fullName: nameSchema,
  phone: phoneSchema,
  userType: z.enum([USER_TYPES.CLIENT, USER_TYPES.DRIVER, USER_TYPES.BLOG_EDITOR], {
    message: 'Please select a user type',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile update schema
export const profileUpdateSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;