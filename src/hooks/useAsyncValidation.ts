'use client';

import { useCallback, useState, useRef, useEffect } from 'react';

export interface AsyncValidationResult {
  isValid: boolean;
  message?: string;
  data?: any;
}

export interface AsyncValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
  dependencies?: any[];
}

export interface UseAsyncValidationReturn {
  isValidating: boolean;
  isValid: boolean | null;
  message: string | null;
  validate: (value: any) => Promise<void>;
  reset: () => void;
  lastValidatedValue: any;
}

/**
 * Hook for handling async validation like email uniqueness checks
 * 
 * @param validator - Async function that returns validation result
 * @param options - Configuration options
 */
export function useAsyncValidation(
  validator: (value: any) => Promise<AsyncValidationResult>,
  options: AsyncValidationOptions = {}
): UseAsyncValidationReturn {
  const {
    debounceMs = 500,
    validateOnMount = false,
    dependencies = [],
  } = options;

  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastValidatedValue, setLastValidatedValue] = useState<any>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validationCounterRef = useRef<number>(0);

  // Reset state
  const reset = useCallback(() => {
    setIsValidating(false);
    setIsValid(null);
    setMessage(null);
    setLastValidatedValue(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Validate function
  const validate = useCallback(async (value: any) => {
    // Don't validate empty values
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      reset();
      return;
    }

    // Don't re-validate the same value
    if (value === lastValidatedValue && isValid !== null) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set loading state immediately
    setIsValidating(true);
    setMessage(null);

    // Debounce the validation
    timeoutRef.current = setTimeout(async () => {
      const currentValidation = ++validationCounterRef.current;
      
      try {
        const result = await validator(value);
        
        // Check if this is still the latest validation request
        if (currentValidation === validationCounterRef.current) {
          setIsValid(result.isValid);
          setMessage(result.message || null);
          setLastValidatedValue(value);
        }
      } catch (error) {
        console.error('Async validation error:', error);
        
        // Only update if this is still the latest validation
        if (currentValidation === validationCounterRef.current) {
          setIsValid(false);
          setMessage('Validation failed. Please try again.');
          setLastValidatedValue(value);
        }
      } finally {
        // Only update loading state if this is still the latest validation
        if (currentValidation === validationCounterRef.current) {
          setIsValidating(false);
        }
      }
    }, debounceMs);
  }, [validator, debounceMs, lastValidatedValue, isValid, reset]);

  // Reset when dependencies change
  useEffect(() => {
    reset();
  }, dependencies);

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount && lastValidatedValue !== null) {
      validate(lastValidatedValue);
    }
  }, [validateOnMount, validate, lastValidatedValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isValidating,
    isValid,
    message,
    validate,
    reset,
    lastValidatedValue,
  };
}

// Predefined validators for common use cases

/**
 * Validates email uniqueness against the API
 */
export function useEmailUniquenessValidation(options: AsyncValidationOptions = {}) {
  return useAsyncValidation(async (email: string): Promise<AsyncValidationResult> => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email');
      }

      const data = await response.json();
      
      return {
        isValid: data.available,
        message: data.available 
          ? 'Email is available' 
          : 'This email is already registered',
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Unable to verify email availability',
      };
    }
  }, options);
}

/**
 * Validates username uniqueness
 */
export function useUsernameValidation(options: AsyncValidationOptions = {}) {
  return useAsyncValidation(async (username: string): Promise<AsyncValidationResult> => {
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to check username');
      }

      const data = await response.json();
      
      return {
        isValid: data.available,
        message: data.available 
          ? 'Username is available' 
          : 'This username is already taken',
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Unable to verify username availability',
      };
    }
  }, options);
}

/**
 * Validates phone number format and availability
 */
export function usePhoneValidation(options: AsyncValidationOptions = {}) {
  return useAsyncValidation(async (phone: string): Promise<AsyncValidationResult> => {
    try {
      // Basic phone validation first
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        return {
          isValid: false,
          message: 'Please enter a valid phone number',
        };
      }

      // Check availability if format is valid
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      if (!response.ok) {
        throw new Error('Failed to check phone number');
      }

      const data = await response.json();
      
      return {
        isValid: data.available,
        message: data.available 
          ? 'Phone number is valid' 
          : 'This phone number is already registered',
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Unable to verify phone number',
      };
    }
  }, options);
}

/**
 * Generic API validation hook
 */
export function useApiValidation(
  endpoint: string,
  fieldName: string,
  options: AsyncValidationOptions = {}
) {
  return useAsyncValidation(async (value: string): Promise<AsyncValidationResult> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldName]: value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate ${fieldName}`);
      }

      const data = await response.json();
      
      return {
        isValid: data.isValid || data.available,
        message: data.message,
        data: data.data,
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Unable to validate ${fieldName}`,
      };
    }
  }, options);
}

// Higher-order hook for combining sync and async validation
export function useCombinedValidation<T>(
  syncValidator: (value: T) => string | null,
  asyncValidator: (value: T) => Promise<AsyncValidationResult>,
  options: AsyncValidationOptions = {}
) {
  const asyncValidation = useAsyncValidation(asyncValidator, options);
  
  const validate = useCallback(async (value: T) => {
    // First run sync validation
    const syncError = syncValidator(value);
    
    if (syncError) {
      // If sync validation fails, don't run async validation
      asyncValidation.reset();
      return {
        isValid: false,
        message: syncError,
        isValidating: false,
      };
    }
    
    // If sync validation passes, run async validation
    await asyncValidation.validate(value);
    
    return {
      isValid: asyncValidation.isValid,
      message: asyncValidation.message,
      isValidating: asyncValidation.isValidating,
    };
  }, [syncValidator, asyncValidation]);
  
  return {
    ...asyncValidation,
    validate,
  };
}