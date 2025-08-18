'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, type InputProps } from '../Input';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
  data?: any;
}

interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onSearch?: (query: string) => void;
  onSelect?: (result: SearchResult) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  debounceMs?: number;
  placeholder?: string;
  maxResults?: number;
  groupByCategory?: boolean;
  highlightQuery?: boolean;
  emptyStateMessage?: string;
  loadingMessage?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch,
    onSelect,
    results = [],
    isLoading = false,
    showSearchIcon = true,
    showClearButton = true,
    debounceMs = 300,
    placeholder = 'Search...',
    maxResults = 10,
    groupByCategory = false,
    highlightQuery = true,
    emptyStateMessage = 'No results found',
    loadingMessage = 'Searching...',
    value,
    onChange,
    onFocus,
    onBlur,
    className,
    ...props 
  }, ref) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isInputFocused, setIsInputFocused] = useState(false);
    
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const resultsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine refs
    const combinedRef = useCallback((node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // Process and limit results
    const processedResults = React.useMemo(() => {
      let filtered = results.slice(0, maxResults);
      
      if (groupByCategory) {
        const grouped = filtered.reduce((acc, result) => {
          const category = result.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push(result);
          return acc;
        }, {} as Record<string, SearchResult[]>);
        
        return Object.entries(grouped).map(([category, items]) => ({
          category,
          items,
        }));
      }
      
      return [{ category: '', items: filtered }];
    }, [results, maxResults, groupByCategory]);

    // Highlight query in text
    const highlightText = useCallback((text: string, query: string) => {
      if (!highlightQuery || !query.trim()) return text;
      
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        ) : part
      );
    }, [highlightQuery]);

    // Handle input change with debounced search
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setQuery(newValue);
      setFocusedIndex(-1);
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Open dropdown if there's a query
      setIsOpen(Boolean(newValue.trim()));
      
      // Debounced search
      if (onSearch) {
        searchTimeoutRef.current = setTimeout(() => {
          onSearch(newValue);
        }, debounceMs);
      }
      
      // Call original onChange
      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: newValue,
        },
      });
    }, [onChange, onSearch, debounceMs]);

    // Handle clear button
    const handleClear = useCallback(() => {
      setQuery('');
      setIsOpen(false);
      setFocusedIndex(-1);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Trigger search with empty query
      onSearch?.('');
      
      // Trigger onChange with empty value
      onChange?.({
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>);
    }, [onSearch, onChange]);

    // Handle result selection
    const handleSelect = useCallback((result: SearchResult) => {
      setQuery(result.title);
      setIsOpen(false);
      setFocusedIndex(-1);
      onSelect?.(result);
    }, [onSelect]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;
      
      const allResults = processedResults.flatMap(group => group.items);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : prev
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
          
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && allResults[focusedIndex]) {
            handleSelect(allResults[focusedIndex]);
          }
          break;
          
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          inputRef.current?.blur();
          break;
      }
      
      props.onKeyDown?.(e);
    }, [isOpen, processedResults, focusedIndex, handleSelect, props.onKeyDown]);

    // Handle focus
    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsInputFocused(true);
      if (query.trim()) {
        setIsOpen(true);
      }
      onFocus?.(e);
    }, [query, onFocus]);

    // Handle blur
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsInputFocused(false);
      
      // Delay closing to allow click on results
      setTimeout(() => {
        if (!resultsRef.current?.contains(document.activeElement)) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      }, 150);
      
      onBlur?.(e);
    }, [onBlur]);

    // Sync external value
    useEffect(() => {
      if (value !== undefined && value !== query) {
        setQuery(value as string);
      }
    }, [value, query]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, []);

    const allResults = processedResults.flatMap(group => group.items);
    const hasResults = allResults.length > 0;
    const showDropdown = isOpen && (hasResults || isLoading || query.trim());

    return (
      <div className="relative">
        <Input
          ref={combinedRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          leftIcon={
            showSearchIcon ? (
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            ) : undefined
          }
          rightIcon={
            <div className="flex items-center space-x-1">
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              )}
              {showClearButton && query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          }
          {...props}
        />

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
            >
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>{loadingMessage}</span>
                </div>
              ) : hasResults ? (
                <div>
                  {processedResults.map((group, groupIndex) => (
                    <div key={group.category || groupIndex}>
                      {group.category && groupByCategory && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                          {group.category}
                        </div>
                      )}
                      
                      {group.items.map((result, itemIndex) => {
                        const globalIndex = processedResults
                          .slice(0, groupIndex)
                          .reduce((acc, g) => acc + g.items.length, 0) + itemIndex;
                        
                        return (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => handleSelect(result)}
                            className={cn(
                              'w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors',
                              globalIndex === focusedIndex && 'bg-blue-50 text-blue-700'
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              {result.icon && (
                                <div className="flex-shrink-0 mt-0.5 text-gray-400">
                                  {result.icon}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900">
                                  {highlightText(result.title, query)}
                                </div>
                                {result.subtitle && (
                                  <div className="text-sm text-gray-600">
                                    {highlightText(result.subtitle, query)}
                                  </div>
                                )}
                                {result.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {highlightText(result.description, query)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>{emptyStateMessage}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Try a different search term
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';