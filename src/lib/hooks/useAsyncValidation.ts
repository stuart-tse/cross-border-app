'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncValidationResult {
  isValid: boolean;
  error?: string;
  isValidating: boolean;
}

export interface AsyncValidator<T = any> {
  validate: (value: T) => Promise<{ isValid: boolean; error?: string }>;
  debounceMs?: number;
}

export interface AsyncValidationConfig {
  debounceMs?: number;
  validateOnMount?: boolean;
  minLength?: number; // Minimum length before validation starts
}

const DEFAULT_CONFIG: AsyncValidationConfig = {
  debounceMs: 500,
  validateOnMount: false,
  minLength: 1,
};

export function useAsyncValidation<T = any>(
  validator: AsyncValidator<T>,
  initialValue?: T,
  config: AsyncValidationConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const debounceTimer = useRef<NodeJS.Timeout>();
  const validationCounter = useRef(0);

  const [state, setState] = useState<AsyncValidationResult>({
    isValid: false,
    isValidating: false,
  });

  const validate = useCallback(
    async (value: T): Promise<AsyncValidationResult> => {
      // Don't validate if value is too short
      if (
        typeof value === 'string' &&
        value.length < (mergedConfig.minLength || 0)
      ) {
        return { isValid: false, isValidating: false };
      }

      // Increment counter to handle race conditions
      const currentValidation = ++validationCounter.current;

      setState(prev => ({ ...prev, isValidating: true }));

      try {
        const result = await validator.validate(value);
        
        // Only update if this is still the latest validation
        if (currentValidation === validationCounter.current) {
          const newState: AsyncValidationResult = {
            isValid: result.isValid,
            error: result.error,
            isValidating: false,
          };
          setState(newState);
          return newState;
        }
        
        return state; // Return current state if validation is stale
      } catch (error) {
        console.error('Async validation error:', error);
        
        if (currentValidation === validationCounter.current) {
          const errorState: AsyncValidationResult = {
            isValid: false,
            error: 'Validation failed. Please try again.',
            isValidating: false,
          };
          setState(errorState);
          return errorState;
        }
        
        return state;
      }
    },
    [validator, mergedConfig.minLength, state]
  );

  const debouncedValidate = useCallback(
    (value: T): Promise<AsyncValidationResult> => {
      return new Promise((resolve) => {
        // Clear existing timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(async () => {
          const result = await validate(value);
          resolve(result);
        }, validator.debounceMs || mergedConfig.debounceMs);
      });
    },
    [validate, validator.debounceMs, mergedConfig.debounceMs]
  );

  // Immediate validation (no debounce)
  const validateImmediate = useCallback(
    (value: T): Promise<AsyncValidationResult> => {
      // Clear debounce timer if exists
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      return validate(value);
    },
    [validate]
  );

  // Reset validation state
  const reset = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    validationCounter.current = 0;
    setState({
      isValid: false,
      isValidating: false,
    });
  }, []);

  // Cancel any pending validation
  const cancel = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setState(prev => ({ ...prev, isValidating: false }));
  }, []);

  // Validate on mount if configured
  useEffect(() => {
    if (mergedConfig.validateOnMount && initialValue !== undefined) {
      validate(initialValue);
    }
  }, [mergedConfig.validateOnMount, initialValue, validate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    ...state,
    validate: debouncedValidate,
    validateImmediate,
    reset,
    cancel,
  };
}

// Pre-built validators for common use cases
export const emailUniqueValidator = (
  checkEmailUnique: (email: string) => Promise<boolean>
): AsyncValidator<string> => ({
  validate: async (email: string) => {
    try {
      const isUnique = await checkEmailUnique(email);
      return {
        isValid: isUnique,
        error: isUnique ? undefined : 'This email is already registered',
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to verify email. Please try again.',
      };
    }
  },
  debounceMs: 800,
});

export const usernameUniqueValidator = (
  checkUsernameUnique: (username: string) => Promise<boolean>
): AsyncValidator<string> => ({
  validate: async (username: string) => {
    try {
      const isUnique = await checkUsernameUnique(username);
      return {
        isValid: isUnique,
        error: isUnique ? undefined : 'This username is already taken',
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to verify username. Please try again.',
      };
    }
  },
  debounceMs: 500,
});

export const phoneUniqueValidator = (
  checkPhoneUnique: (phone: string) => Promise<boolean>
): AsyncValidator<string> => ({
  validate: async (phone: string) => {
    try {
      const isUnique = await checkPhoneUnique(phone);
      return {
        isValid: isUnique,
        error: isUnique ? undefined : 'This phone number is already registered',
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to verify phone number. Please try again.',
      };
    }
  },
  debounceMs: 800,
});

// Hook to combine multiple async validations
export function useMultipleAsyncValidations<T = any>(
  value: T,
  validators: AsyncValidator<T>[],
  config: AsyncValidationConfig = {}
) {
  const [results, setResults] = useState<AsyncValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    async (val: T) => {
      setIsValidating(true);
      
      try {
        const validationPromises = validators.map(validator => 
          validator.validate(val)
        );
        
        const validationResults = await Promise.all(validationPromises);
        
        const formattedResults: AsyncValidationResult[] = validationResults.map(result => ({
          isValid: result.isValid,
          error: result.error,
          isValidating: false,
        }));
        
        setResults(formattedResults);
        return formattedResults;
      } catch (error) {
        console.error('Multiple async validation error:', error);
        const errorResults: AsyncValidationResult[] = validators.map(() => ({
          isValid: false,
          error: 'Validation failed',
          isValidating: false,
        }));
        setResults(errorResults);
        return errorResults;
      } finally {
        setIsValidating(false);
      }
    },
    [validators]
  );

  const isValid = results.length > 0 && results.every(result => result.isValid);
  const errors = results.filter(result => result.error).map(result => result.error);
  const firstError = errors[0];

  return {
    results,
    isValid,
    isValidating,
    errors,
    error: firstError,
    validate,
  };
}