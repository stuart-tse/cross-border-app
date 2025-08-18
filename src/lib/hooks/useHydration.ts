import { useEffect, useState } from 'react';

/**
 * Hook to detect when component has hydrated on the client side.
 * Useful for preventing hydration mismatches when dealing with
 * browser-only APIs or dynamic content.
 * 
 * @returns {boolean} true if component has hydrated on client side
 */
export function useHydration(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

/**
 * Hook for safely accessing localStorage without causing hydration mismatches.
 * Returns null during SSR and the actual value after hydration.
 * 
 * @param key - localStorage key
 * @param defaultValue - default value to return if key doesn't exist
 * @returns localStorage value or null during SSR
 */
export function useLocalStorage<T>(
  key: string, 
  defaultValue: T
): [T | null, (value: T) => void] {
  const hasHydrated = useHydration();
  const [storedValue, setStoredValue] = useState<T | null>(null);

  // Initialize value after hydration
  useEffect(() => {
    if (hasHydrated) {
      try {
        const item = window.localStorage.getItem(key);
        const parsed = item ? JSON.parse(item) : defaultValue;
        setStoredValue(parsed);
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setStoredValue(defaultValue);
      }
    }
  }, [hasHydrated, key, defaultValue]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for client-side only state management.
 * Useful for components that should not render certain content during SSR.
 * 
 * @returns {boolean} true if should render client-only content
 */
export function useClientOnly() {
  const hasHydrated = useHydration();
  
  return {
    isClient: hasHydrated,
    isServer: !hasHydrated
  };
}