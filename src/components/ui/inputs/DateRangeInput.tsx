'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, type InputProps } from '../Input';
import { cn } from '@/lib/utils';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  separator?: string;
  placeholder?: string;
  allowSingleDate?: boolean;
  presets?: {
    label: string;
    range: DateRange;
  }[];
}

const DEFAULT_PRESETS = [
  {
    label: 'Today',
    range: { 
      start: new Date(), 
      end: new Date() 
    }
  },
  {
    label: 'Yesterday',
    range: { 
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), 
      end: new Date(Date.now() - 24 * 60 * 60 * 1000) 
    }
  },
  {
    label: 'Last 7 days',
    range: { 
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
      end: new Date() 
    }
  },
  {
    label: 'Last 30 days',
    range: { 
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
      end: new Date() 
    }
  },
  {
    label: 'This month',
    range: { 
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) 
    }
  },
  {
    label: 'Last month',
    range: { 
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), 
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) 
    }
  }
];

export const DateRangeInput = forwardRef<HTMLInputElement, DateRangeInputProps>(
  ({ 
    value = { start: null, end: null },
    onChange,
    minDate,
    maxDate,
    format = 'MM/dd/yyyy',
    separator = ' - ',
    placeholder = 'Select date range',
    allowSingleDate = false,
    presets = DEFAULT_PRESETS,
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Format date according to specified format
    const formatDate = useCallback((date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      
      switch (format) {
        case 'dd/MM/yyyy':
          return `${day}/${month}/${year}`;
        case 'yyyy-MM-dd':
          return `${year}-${month}-${day}`;
        default:
          return `${month}/${day}/${year}`;
      }
    }, [format]);

    // Format date range for display
    const formatRange = useCallback((range: DateRange): string => {
      if (!range.start) return '';
      
      if (!range.end) {
        return allowSingleDate ? formatDate(range.start) : '';
      }
      
      if (range.start.getTime() === range.end.getTime()) {
        return formatDate(range.start);
      }
      
      return `${formatDate(range.start)}${separator}${formatDate(range.end)}`;
    }, [formatDate, separator, allowSingleDate]);

    // Check if date is in range
    const isDateInRange = useCallback((date: Date, range: DateRange): boolean => {
      if (!range.start || !range.end) return false;
      const time = date.getTime();
      return time >= range.start.getTime() && time <= range.end.getTime();
    }, []);

    // Check if date is disabled
    const isDateDisabled = useCallback((date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    }, [minDate, maxDate]);

    // Handle date click
    const handleDateClick = useCallback((date: Date) => {
      if (isDateDisabled(date)) return;
      
      if (!value.start || (value.start && value.end && !selectingEnd)) {
        // Start new selection
        onChange?.({ start: date, end: null });
        setSelectingEnd(true);
      } else if (selectingEnd) {
        // Complete the range
        if (date < value.start) {
          onChange?.({ start: date, end: value.start });
        } else {
          onChange?.({ start: value.start, end: date });
        }
        setSelectingEnd(false);
        setIsOpen(false);
      }
    }, [value, onChange, selectingEnd, isDateDisabled]);

    // Handle preset click
    const handlePresetClick = useCallback((preset: typeof presets[0]) => {
      onChange?.(preset.range);
      setIsOpen(false);
    }, [onChange]);

    // Generate calendar days
    const generateCalendarDays = useCallback((month: Date) => {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const startOfWeek = new Date(startOfMonth);
      startOfWeek.setDate(startOfMonth.getDate() - startOfMonth.getDay());
      
      const days = [];
      const current = new Date(startOfWeek);
      
      while (current <= endOfMonth || current.getDay() !== 0) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
        
        if (days.length > 42) break; // Max 6 weeks
      }
      
      return days;
    }, []);

    // Navigate months
    const navigateMonth = useCallback((direction: 'prev' | 'next') => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
        return newMonth;
      });
    }, []);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
            inputRef.current && !inputRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSelectingEnd(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayValue = formatRange(value);
    const calendarDays = generateCalendarDays(currentMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className={cn('cursor-pointer', className)}
          leftIcon={
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          }
          rightIcon={
            <svg 
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform", 
                isOpen && "rotate-180"
              )} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          }
          {...props}
        />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[320px]"
            >
              {/* Presets */}
              {presets.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="px-3 py-2 text-sm text-left hover:bg-gray-50 rounded transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = value.start?.toDateString() === day.toDateString() || 
                                   value.end?.toDateString() === day.toDateString();
                  const isInRange = isDateInRange(day, value) || 
                    (value.start && hoveredDate && selectingEnd && 
                     isDateInRange(day, { start: value.start, end: hoveredDate }));
                  const isDisabled = isDateDisabled(day);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateClick(day)}
                      onMouseEnter={() => setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                      disabled={isDisabled}
                      className={cn(
                        'p-2 text-sm transition-colors relative',
                        !isCurrentMonth && 'text-gray-300',
                        isCurrentMonth && 'text-gray-700 hover:bg-gray-100',
                        isToday && 'font-bold',
                        isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                        isInRange && !isSelected && 'bg-blue-100 text-blue-700',
                        isDisabled && 'text-gray-300 cursor-not-allowed opacity-50'
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {selectingEnd && value.start ? 'Select end date' : 'Select start date'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.({ start: null, end: null });
                    setIsOpen(false);
                    setSelectingEnd(false);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DateRangeInput.displayName = 'DateRangeInput';