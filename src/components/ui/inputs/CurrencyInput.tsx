'use client';

import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { Input, type InputProps } from '../Input';

interface CurrencyInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  currency?: string;
  locale?: string;
  allowNegative?: boolean;
  maxValue?: number;
  minValue?: number;
  precision?: number;
  onValueChange?: (value: number | null, formattedValue: string) => void;
}

const CURRENCY_CONFIG = {
  HKD: { symbol: 'HK$', position: 'before' as const, locale: 'en-HK' },
  USD: { symbol: '$', position: 'before' as const, locale: 'en-US' },
  CNY: { symbol: '¥', position: 'before' as const, locale: 'zh-CN' },
  EUR: { symbol: '€', position: 'before' as const, locale: 'en-EU' },
  GBP: { symbol: '£', position: 'before' as const, locale: 'en-GB' },
  JPY: { symbol: '¥', position: 'before' as const, locale: 'ja-JP' },
  SGD: { symbol: 'S$', position: 'before' as const, locale: 'en-SG' },
  MYR: { symbol: 'RM', position: 'before' as const, locale: 'en-MY' },
  THB: { symbol: '฿', position: 'before' as const, locale: 'th-TH' },
  TWD: { symbol: 'NT$', position: 'before' as const, locale: 'zh-TW' },
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ 
    currency = 'HKD',
    locale: customLocale,
    allowNegative = false,
    maxValue,
    minValue,
    precision = 2,
    onValueChange,
    value,
    onChange,
    error: externalError,
    className,
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [numericValue, setNumericValue] = useState<number | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const currencyConfig = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.HKD;
    const usedLocale = customLocale || currencyConfig.locale;

    // Format number as currency
    const formatCurrency = useCallback((num: number | null): string => {
      if (num === null || isNaN(num)) return '';
      
      try {
        return new Intl.NumberFormat(usedLocale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(num);
      } catch {
        // Fallback formatting
        const symbol = currencyConfig.symbol;
        const formattedNum = num.toLocaleString(usedLocale, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        });
        return `${symbol}${formattedNum}`;
      }
    }, [currency, precision, usedLocale, currencyConfig.symbol]);

    // Parse input value to number
    const parseValue = useCallback((inputValue: string): number | null => {
      if (!inputValue) return null;
      
      // Remove currency symbols and formatting
      let cleanValue = inputValue
        .replace(new RegExp(`[${currencyConfig.symbol}]`, 'g'), '')
        .replace(/,/g, '')
        .replace(/\s/g, '')
        .trim();
      
      // Handle negative values
      if (!allowNegative && cleanValue.startsWith('-')) {
        cleanValue = cleanValue.substring(1);
      }
      
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? null : parsed;
    }, [currencyConfig.symbol, allowNegative]);

    // Validate value against constraints
    const validateValue = useCallback((val: number | null): string | null => {
      if (val === null) return null;
      
      if (!allowNegative && val < 0) {
        return 'Negative values are not allowed';
      }
      
      if (minValue !== undefined && val < minValue) {
        return `Minimum value is ${formatCurrency(minValue)}`;
      }
      
      if (maxValue !== undefined && val > maxValue) {
        return `Maximum value is ${formatCurrency(maxValue)}`;
      }
      
      return null;
    }, [allowNegative, minValue, maxValue, formatCurrency]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      
      const parsed = parseValue(inputValue);
      setNumericValue(parsed);
      
      // Call original onChange with raw input
      onChange?.(e);
      
      // Call value change callback
      onValueChange?.(parsed, inputValue);
    }, [parseValue, onChange, onValueChange]);

    // Handle focus
    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // Show raw numeric value when focused (easier to edit)
      if (numericValue !== null) {
        const rawValue = numericValue.toString();
        setDisplayValue(rawValue);
        
        // Update the input element value directly
        setTimeout(() => {
          if (e.target) {
            e.target.value = rawValue;
            e.target.select();
          }
        }, 0);
      }
      
      props.onFocus?.(e);
    }, [numericValue, props.onFocus]);

    // Handle blur
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Format as currency when not focused
      if (numericValue !== null) {
        const formatted = formatCurrency(numericValue);
        setDisplayValue(formatted);
        
        // Update the input element value
        setTimeout(() => {
          if (e.target) {
            e.target.value = formatted;
          }
        }, 0);
      }
      
      props.onBlur?.(e);
    }, [numericValue, formatCurrency, props.onBlur]);

    // Sync with external value changes
    useEffect(() => {
      if (value !== undefined) {
        const parsed = typeof value === 'number' ? value : parseValue(value as string);
        setNumericValue(parsed);
        
        if (!isFocused) {
          // Show formatted value when not focused
          setDisplayValue(parsed !== null ? formatCurrency(parsed) : '');
        } else {
          // Show raw value when focused
          setDisplayValue(parsed !== null ? parsed.toString() : '');
        }
      }
    }, [value, parseValue, formatCurrency, isFocused]);

    // Validation error
    const validationError = validateValue(numericValue);
    const errorMessage = externalError || validationError;

    // Keyboard event handlers
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End'
      ];
      
      const isNumber = /^[0-9]$/.test(e.key);
      const isDecimal = e.key === '.' && precision > 0;
      const isMinus = e.key === '-' && allowNegative;
      const isCtrlA = e.ctrlKey && e.key === 'a';
      const isCtrlC = e.ctrlKey && e.key === 'c';
      const isCtrlV = e.ctrlKey && e.key === 'v';
      const isCtrlZ = e.ctrlKey && e.key === 'z';
      
      if (!isNumber && !isDecimal && !isMinus && !allowedKeys.includes(e.key) && 
          !isCtrlA && !isCtrlC && !isCtrlV && !isCtrlZ) {
        e.preventDefault();
      }
      
      props.onKeyDown?.(e);
    }, [precision, allowNegative, props.onKeyDown]);

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        error={errorMessage}
        leftIcon={
          <span className="text-gray-600 font-medium">
            {currencyConfig.symbol}
          </span>
        }
        placeholder={`0${precision > 0 ? '.' + '0'.repeat(precision) : ''}`}
        autoComplete="off"
        className={className}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';