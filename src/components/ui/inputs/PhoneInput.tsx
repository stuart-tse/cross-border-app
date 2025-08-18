'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import { Input, type InputProps } from '../Input';
import { useAsyncValidation, usePhoneValidation } from '@/hooks/useAsyncValidation';

interface PhoneInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  countryCode?: string;
  validateUniqueness?: boolean;
  onValidationChange?: (isValid: boolean | null, message: string | null) => void;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+852', country: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+853', country: 'MO', flag: '🇲🇴', name: 'Macau' },
  { code: '+886', country: 'TW', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
];

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ 
    countryCode = '+852', 
    validateUniqueness = false, 
    onValidationChange, 
    value, 
    onChange, 
    error: externalError,
    ...props 
  }, ref) => {
    const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Use phone validation hook if uniqueness validation is enabled
    const phoneValidation = usePhoneValidation({
      debounceMs: 500,
    });

    // Format phone number display
    const formatPhoneNumber = useCallback((phoneNumber: string) => {
      if (!phoneNumber) return '';
      
      // Remove all non-digits
      const digits = phoneNumber.replace(/\D/g, '');
      
      // Format based on length and country
      if (selectedCountryCode === '+1') {
        // US format: (123) 456-7890
        if (digits.length >= 10) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        } else if (digits.length >= 6) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length >= 3) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
      } else if (selectedCountryCode === '+852') {
        // Hong Kong format: 1234 5678
        if (digits.length >= 8) {
          return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
        } else if (digits.length >= 4) {
          return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        }
      }
      
      // Default formatting: add spaces every 3-4 digits
      return digits.replace(/(\d{3,4})(?=\d)/g, '$1 ');
    }, [selectedCountryCode]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatPhoneNumber(rawValue);
      const fullNumber = selectedCountryCode + rawValue.replace(/\D/g, '');
      
      // Call original onChange with formatted value
      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: formattedValue,
        },
      });

      // Validate uniqueness if enabled
      if (validateUniqueness && rawValue.replace(/\D/g, '').length >= 8) {
        phoneValidation.validate(fullNumber);
      } else {
        phoneValidation.reset();
      }
    }, [selectedCountryCode, formatPhoneNumber, onChange, validateUniqueness, phoneValidation]);

    // Handle country code selection
    const handleCountryCodeChange = useCallback((newCountryCode: string) => {
      setSelectedCountryCode(newCountryCode);
      setIsDropdownOpen(false);
      
      // Reformat current value with new country code
      if (value) {
        const digits = (value as string).replace(/\D/g, '');
        const formattedValue = formatPhoneNumber(digits);
        const fullNumber = newCountryCode + digits;
        
        // Trigger onChange with new format
        onChange?.({
          target: { value: formattedValue }
        } as React.ChangeEvent<HTMLInputElement>);

        // Re-validate if enabled
        if (validateUniqueness && digits.length >= 8) {
          phoneValidation.validate(fullNumber);
        }
      }
    }, [value, formatPhoneNumber, onChange, validateUniqueness, phoneValidation]);

    // Report validation changes
    React.useEffect(() => {
      if (validateUniqueness && onValidationChange) {
        onValidationChange(phoneValidation.isValid, phoneValidation.message);
      }
    }, [validateUniqueness, phoneValidation.isValid, phoneValidation.message, onValidationChange]);

    // Get current country info
    const currentCountry = COUNTRY_CODES.find(c => c.code === selectedCountryCode) || COUNTRY_CODES[3];

    // Determine error message
    let errorMessage = externalError;
    if (validateUniqueness && phoneValidation.message && phoneValidation.isValid === false) {
      errorMessage = phoneValidation.message;
    }

    // Determine success message
    let successMessage;
    if (validateUniqueness && phoneValidation.isValid === true) {
      successMessage = phoneValidation.message || 'Phone number is valid';
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="tel"
          value={value}
          onChange={handleInputChange}
          error={errorMessage}
          success={successMessage}
          leftIcon={
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
                aria-label="Select country code"
              >
                <span className="text-sm">{currentCountry.flag}</span>
                <span className="text-sm font-mono text-gray-600">
                  {selectedCountryCode}
                </span>
                <svg 
                  className={`w-3 h-3 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Country Code Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountryCodeChange(country.code)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                        selectedCountryCode === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{country.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{country.code}</div>
                      </div>
                      {selectedCountryCode === country.code && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
          rightIcon={
            validateUniqueness && phoneValidation.isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : undefined
          }
          placeholder="Enter phone number"
          autoComplete="tel"
          {...props}
        />

        {/* Click outside handler */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';