'use client';

import React, { createContext, useContext, useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Context for managing select state
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

// Root Select component
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  children: React.ReactNode;
  name?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange = () => {},
  defaultValue = '',
  placeholder,
  children,
  name
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange(newValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        placeholder,
        isOpen,
        setIsOpen,
      }}
    >
      <div className="relative">
        {/* Hidden input for form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValue}
          />
        )}
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// Select Trigger
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'min-h-[44px]',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        {children}
        <ChevronDownIcon className={cn('ml-2 h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

// Select Value
interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder: propPlaceholder, className }) => {
  const { value, placeholder: contextPlaceholder } = useSelectContext();
  const placeholderText = propPlaceholder || contextPlaceholder;
  
  return (
    <span className={cn('block truncate', !value && 'text-gray-400', className)}>
      {value || placeholderText}
    </span>
  );
};

// Select Content
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { isOpen, setIsOpen } = useSelectContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg',
              'max-h-60 overflow-auto',
              className
            )}
            role="listbox"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Select Item
interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({ 
  value: itemValue, 
  children, 
  className,
  disabled = false 
}) => {
  const { value, onValueChange } = useSelectContext();
  const isSelected = value === itemValue;

  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center py-2 px-3 text-sm outline-none',
        'hover:bg-gray-50 focus:bg-gray-50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isSelected && 'bg-gray-100',
        className
      )}
      onClick={() => !disabled && onValueChange(itemValue)}
      disabled={disabled}
      role="option"
      aria-selected={isSelected}
    >
      {children}
      {isSelected && (
        <CheckIcon className="ml-auto h-4 w-4" />
      )}
    </button>
  );
};

// Icons
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);