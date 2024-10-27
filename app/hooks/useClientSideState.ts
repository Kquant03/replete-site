// hooks/useClientSideState.ts
import { useState, useEffect } from 'react';

export function useClientSideState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize with the initial value
  const [state, setState] = useState<T>(initialValue);

  // Once mounted, check localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Update state and localStorage when value changes
  const setValue = (value: T) => {
    try {
      setState(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  };

  return [state, setValue];
}