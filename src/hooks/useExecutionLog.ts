import { useState, useCallback } from 'react';
import { ExecutionLog } from '@/components/ExecutionLogPanel';

export const useExecutionLog = () => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const addLog = useCallback((
    type: ExecutionLog['type'],
    message: string,
    stepName?: string
  ) => {
    const newLog: ExecutionLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      stepName
    };
    
    setLogs(prevLogs => [...prevLogs, newLog]);
    
    // Auto-show panel when new logs are added
    if (!isVisible) {
      setIsVisible(true);
    }
  }, [isVisible]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const showPanel = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hidePanel = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    logs,
    isVisible,
    addLog,
    clearLogs,
    toggleVisibility,
    showPanel,
    hidePanel
  };
};