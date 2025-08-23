import { useState, useEffect, useCallback } from 'react';
import { FunctionData } from '@/types/workflow';

interface UseFunctionsReturn {
  functions: FunctionData[];
  isLoading: boolean;
  error: string | null;
  loadFunctions: () => Promise<void>;
  addFunction: (functionData: FunctionData) => Promise<boolean>;
  updateFunction: (functionData: FunctionData) => Promise<boolean>;
  deleteFunction: (id: string) => Promise<boolean>;
}

export const useFunctions = (): UseFunctionsReturn => {
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFunctions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/functions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFunctions(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load functions';
      setError(errorMessage);
      console.error('Failed to load functions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFunction = useCallback(async (functionData: FunctionData): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/functions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add function');
      }

      await loadFunctions();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add function';
      setError(errorMessage);
      return false;
    }
  }, [loadFunctions]);

  const updateFunction = useCallback(async (functionData: FunctionData): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/functions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update function');
      }

      await loadFunctions();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update function';
      setError(errorMessage);
      return false;
    }
  }, [loadFunctions]);

  const deleteFunction = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/functions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete function');
      }

      await loadFunctions();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete function';
      setError(errorMessage);
      return false;
    }
  }, [loadFunctions]);

  useEffect(() => {
    loadFunctions();
  }, [loadFunctions]);

  return {
    functions,
    isLoading,
    error,
    loadFunctions,
    addFunction,
    updateFunction,
    deleteFunction
  };
};