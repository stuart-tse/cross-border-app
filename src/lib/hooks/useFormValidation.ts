'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { z, ZodSchema, ZodError } from 'zod';

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touchedFields: Set<keyof T>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface FormMethods<T> {
  setValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;
  markFieldAsTouched: (field: keyof T) => void;
  markAllFieldsAsTouched: () => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: (initialData?: Partial<T>) => void;
  setFormData: (data: Partial<T>) => void;
}

export interface FormConfig<T> {
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  revalidateMode?: 'onChange' | 'onBlur';
  validateOnMount?: boolean;
  debounceMs?: number;
}

const DEFAULT_CONFIG: FormConfig<any> = {
  validationMode: 'onBlur',
  revalidateMode: 'onChange',
  validateOnMount: false,
  debounceMs: 300,
};

export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialData: Partial<T>,
  config: FormConfig<T> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const initialDataRef = useRef(initialData);
  const debounceTimers = useRef<Map<keyof T, NodeJS.Timeout>>(new Map());

  const [formState, setFormState] = useState<FormState<T>>(() => ({
    data: { ...initialData } as T,
    errors: {},
    touchedFields: new Set(),
    isValid: false,
    isSubmitting: false,
    isDirty: false,
  }));

  // Validate a single field
  const validateField = useCallback(
    async (field: keyof T): Promise<boolean> => {
      try {
        const fieldValue = formState.data[field];
        
        // Create a partial schema for single field validation
        const result = schema.safeParse({ ...formState.data, [field]: fieldValue });
        
        if (result.success) {
          setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, [field]: undefined },
          }));
          return true;
        } else {
          const fieldError = result.error.errors.find((err: z.ZodIssue) => err.path[0] === field);
          if (fieldError) {
            setFormState(prev => ({
              ...prev,
              errors: { ...prev.errors, [field]: fieldError.message },
            }));
          }
          return false;
        }
      } catch (error) {
        console.error('Field validation error:', error);
        return false;
      }
    },
    [schema, formState.data]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      const result = schema.safeParse(formState.data);
      
      if (result.success) {
        setFormState(prev => ({
          ...prev,
          errors: {},
          isValid: true,
        }));
        return true;
      } else {
        const errors: Partial<Record<keyof T, string>> = {};
        result.error.errors.forEach((err: z.ZodIssue) => {
          const field = err.path[0] as keyof T;
          if (field && !errors[field]) {
            errors[field] = err.message;
          }
        });
        
        setFormState(prev => ({
          ...prev,
          errors,
          isValid: false,
        }));
        return false;
      }
    } catch (error) {
      console.error('Form validation error:', error);
      return false;
    }
  }, [schema, formState.data]);

  // Debounced validation for performance
  const debouncedValidateField = useCallback(
    (field: keyof T) => {
      const timer = debounceTimers.current.get(field);
      if (timer) {
        clearTimeout(timer);
      }

      const newTimer = setTimeout(() => {
        validateField(field);
        debounceTimers.current.delete(field);
      }, mergedConfig.debounceMs);

      debounceTimers.current.set(field, newTimer);
    },
    [validateField, mergedConfig.debounceMs]
  );

  // Set field value with optional validation
  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setFormState(prev => {
        const newData = { ...prev.data, [field]: value };
        const isDirty = JSON.stringify(newData) !== JSON.stringify(initialDataRef.current);
        
        return {
          ...prev,
          data: newData,
          isDirty,
        };
      });

      // Validate on change if field is touched and revalidation mode is onChange
      if (
        formState.touchedFields.has(field) &&
        mergedConfig.revalidateMode === 'onChange'
      ) {
        debouncedValidateField(field);
      }
    },
    [formState.touchedFields, mergedConfig.revalidateMode, debouncedValidateField]
  );

  // Mark field as touched
  const markFieldAsTouched = useCallback(
    (field: keyof T) => {
      setFormState(prev => ({
        ...prev,
        touchedFields: new Set([...prev.touchedFields, field]),
      }));

      // Validate on blur if validation mode is onBlur
      if (mergedConfig.validationMode === 'onBlur') {
        validateField(field);
      }
    },
    [validateField, mergedConfig.validationMode]
  );

  // Mark all fields as touched
  const markAllFieldsAsTouched = useCallback(() => {
    const allFields = Object.keys(formState.data) as (keyof T)[];
    setFormState(prev => ({
      ...prev,
      touchedFields: new Set(allFields),
    }));
  }, [formState.data]);

  // Error management methods
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: undefined },
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: {},
    }));
  }, []);

  // Reset form
  const resetForm = useCallback((newInitialData?: Partial<T>) => {
    const resetData = newInitialData || initialDataRef.current;
    initialDataRef.current = resetData;
    
    setFormState({
      data: { ...resetData } as T,
      errors: {},
      touchedFields: new Set(),
      isValid: false,
      isSubmitting: false,
      isDirty: false,
    });
    
    // Clear all debounce timers
    debounceTimers.current.forEach(timer => clearTimeout(timer));
    debounceTimers.current.clear();
  }, []);

  // Set form data (useful for external updates)
  const setFormData = useCallback((data: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
      isDirty: JSON.stringify({ ...prev.data, ...data }) !== JSON.stringify(initialDataRef.current),
    }));
  }, []);

  // Set submitting state
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  // Validate on mount if configured
  useEffect(() => {
    if (mergedConfig.validateOnMount) {
      validateForm();
    }
  }, [mergedConfig.validateOnMount, validateForm]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);

  const formMethods: FormMethods<T> = {
    setValue,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    markFieldAsTouched,
    markAllFieldsAsTouched,
    validateField,
    validateForm,
    resetForm,
    setFormData,
  };

  return {
    ...formState,
    ...formMethods,
    setSubmitting,
  };
}

// Helper hook for form submission
export function useFormSubmit<T extends Record<string, any>>(
  formMethods: FormMethods<T> & { setSubmitting: (submitting: boolean) => void },
  onSubmit: (data: T) => Promise<void> | void,
  options: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
    validateBeforeSubmit?: boolean;
  } = {}
) {
  const { validateBeforeSubmit = true } = options;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      try {
        formMethods.setSubmitting(true);
        
        // Mark all fields as touched for validation display
        formMethods.markAllFieldsAsTouched();
        
        // Validate before submit if enabled
        if (validateBeforeSubmit) {
          const isValid = await formMethods.validateForm();
          if (!isValid) {
            return;
          }
        }
        
        // Get form data - this will be type-safe
        const formData = formMethods as any; // We know this has data property
        await onSubmit(formData.data);
        
        options.onSuccess?.();
      } catch (error) {
        console.error('Form submission error:', error);
        options.onError?.(error);
      } finally {
        formMethods.setSubmitting(false);
      }
    },
    [formMethods, onSubmit, validateBeforeSubmit, options]
  );

  return { handleSubmit };
}