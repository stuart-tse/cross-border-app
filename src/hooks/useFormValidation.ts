'use client';

import { useCallback, useState, useRef } from 'react';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationState<T> {
  data: Partial<T>;
  errors: Record<string, string>;
  touchedFields: Set<string>;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  revalidateOnSubmit?: boolean;
}

export interface UseFormValidationReturn<T> {
  // State
  formData: Partial<T>;
  errors: Record<string, string>;
  touchedFields: Set<string>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  
  // Actions
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, message: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  touchField: (field: keyof T) => void;
  touchAllFields: () => void;
  validateField: (field: keyof T, value?: any) => string | null;
  validateForm: () => ValidationError[];
  reset: (initialData?: Partial<T>) => void;
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  
  // Helpers
  getFieldProps: (field: keyof T) => {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error: string | undefined;
  };
}

/**
 * Enhanced form validation hook with real-time validation, error handling, and submission management
 * 
 * @param schema - Zod schema for validation
 * @param initialData - Initial form data
 * @param options - Validation behavior options
 */
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {},
  options: FormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    revalidateOnSubmit = true,
  } = options;

  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialDataRef = useRef(initialData);
  
  // Derived state
  const isValid = Object.keys(errors).length === 0 && Object.keys(formData).length > 0;
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);

  // Validate a single field
  const validateField = useCallback((field: keyof T, value?: any): string | null => {
    try {
      const testData = { 
        ...formData, 
        [field]: value !== undefined ? value : formData[field] 
      };
      
      // Attempt to parse the entire schema for cross-field validation
      const result = schema.safeParse(testData);
      
      if (!result.success) {
        const fieldError = result.error.issues.find((err: any) => 
          err.path.length > 0 && err.path[0] === field
        );
        return fieldError?.message || null;
      }
      
      return null;
    } catch (error) {
      console.error('Validation error:', error);
      return 'Validation failed';
    }
  }, [formData, schema]);

  // Validate entire form
  const validateForm = useCallback((): ValidationError[] => {
    const result = schema.safeParse(formData);
    
    if (!result.success) {
      const validationErrors: ValidationError[] = [];
      const errorMap: Record<string, string> = {};
      
      result.error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          const field = err.path[0] as string;
          const error = {
            field,
            message: err.message,
          };
          validationErrors.push(error);
          errorMap[field] = err.message;
        }
      });
      
      setErrors(errorMap);
      return validationErrors;
    }
    
    setErrors({});
    return [];
  }, [formData, schema]);

  // Set single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation if enabled and field is touched
    if (validateOnChange && touchedFields.has(field as string)) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || '',
      }));
      
      // Clean up empty errors
      if (!error) {
        setErrors(prev => {
          const { [field as string]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [validateField, validateOnChange, touchedFields]);

  // Set multiple values at once
  const setValues = useCallback((values: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...values }));
    
    // Validate changed fields if they are touched
    if (validateOnChange) {
      const newErrors = { ...errors };
      let hasChanges = false;
      
      Object.keys(values).forEach(field => {
        if (touchedFields.has(field)) {
          const error = validateField(field as keyof T, values[field as keyof T]);
          if (error) {
            newErrors[field] = error;
            hasChanges = true;
          } else {
            delete newErrors[field];
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) {
        setErrors(newErrors);
      }
    }
  }, [errors, touchedFields, validateField, validateOnChange]);

  // Set field error manually
  const setError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => ({ ...prev, [field as string]: message }));
  }, []);

  // Clear single field error
  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const { [field as string]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Touch a single field
  const touchField = useCallback((field: keyof T) => {
    setTouchedFields(prev => new Set(Array.from(prev).concat([field as string])));
    
    // Validate field on touch if enabled
    if (validateOnBlur) {
      const error = validateField(field);
      if (error) {
        setError(field, error);
      } else {
        clearError(field);
      }
    }
  }, [validateField, validateOnBlur, setError, clearError]);

  // Touch all fields
  const touchAllFields = useCallback(() => {
    const allFields = Object.keys(formData).concat(
      (schema as any)._def?.shape ? Object.keys((schema as any)._def.shape) : []
    );
    setTouchedFields(new Set(allFields));
  }, [formData, schema]);

  // Reset form
  const reset = useCallback((newInitialData?: Partial<T>) => {
    const dataToReset = newInitialData || initialDataRef.current;
    setFormData(dataToReset);
    setErrors({});
    setTouchedFields(new Set());
    setIsSubmitting(false);
    initialDataRef.current = dataToReset;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((
    onSubmit: (data: T) => Promise<void> | void
  ) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      setIsSubmitting(true);
      
      try {
        // Touch all fields
        touchAllFields();
        
        // Validate form
        const validationErrors = validateForm();
        
        if (validationErrors.length > 0) {
          // Focus first error field if possible
          const firstErrorField = validationErrors[0].field;
          const fieldElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          if (fieldElement) {
            fieldElement.focus();
          }
          
          throw new Error(`Validation failed: ${validationErrors.length} error(s)`);
        }
        
        // Parse with schema to ensure type safety
        const result = schema.parse(formData);
        
        // Call the submit handler
        await onSubmit(result);
        
        // Clear errors on successful submission
        if (revalidateOnSubmit) {
          clearAllErrors();
        }
        
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [formData, schema, touchAllFields, validateForm, clearAllErrors, revalidateOnSubmit]);

  // Helper to get field props for easy input binding
  const getFieldProps = useCallback((field: keyof T) => {
    return {
      name: field as string,
      value: formData[field] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValue(field, e.target.value);
      },
      onBlur: () => {
        touchField(field);
      },
      error: errors[field as string],
    };
  }, [formData, errors, setValue, touchField]);

  return {
    // State
    formData,
    errors,
    touchedFields,
    isValid,
    isDirty,
    isSubmitting,
    
    // Actions
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    touchField,
    touchAllFields,
    validateField,
    validateForm,
    reset,
    handleSubmit,
    
    // Helpers
    getFieldProps,
  };
}

// Convenience hook for simple forms with basic validation
export function useSimpleForm<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {}
) {
  return useFormValidation(schema, initialData, {
    validateOnChange: true,
    validateOnBlur: true,
    revalidateOnSubmit: true,
  });
}

// Hook for forms that only validate on submit
export function useSubmitOnlyForm<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {}
) {
  return useFormValidation(schema, initialData, {
    validateOnChange: false,
    validateOnBlur: false,
    revalidateOnSubmit: true,
  });
}