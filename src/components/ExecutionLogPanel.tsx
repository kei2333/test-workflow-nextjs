import React, { useEffect, useRef } from 'react';

export interface ExecutionLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  stepName?: string;
  executionTime?: number; // Execution time in milliseconds
}

interface ExecutionLogPanelProps {
  logs: ExecutionLog[];
  isVisible: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export const ExecutionLogPanel: React.FC<ExecutionLogPanelProps> = ({
  logs,
  isVisible,
  onToggle,
  onClear
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current && logs.length > 0) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLogIcon = (type: ExecutionLog['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getLogTextColor = (type: ExecutionLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed bottom-0 right-4 left-4 transition-all duration-300 z-40 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 backdrop-blur-xl rounded-t-2xl shadow-2xl border border-white/60 max-h-80 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 via-transparent to-emerald-100/10 pointer-events-none"></div>
        {/* Header */}
        <div className="relative flex items-center justify-between p-3 border-b border-gradient-to-r from-blue-200/30 via-cyan-200/30 to-emerald-200/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-ping opacity-30"></div>
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Execution Log</h3>
            </div>
            <span className="text-base text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200/50">
              {logs.length} entries
            </span>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50/80 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105"
              title="Clear logs"
            >
              Clear
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white/60 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105"
              title={isVisible ? 'Hide log' : 'Show log'}
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isVisible ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Log Content */}
        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 via-cyan-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-cyan-200/20 to-emerald-200/20"></div>
                <svg className="w-8 h-8 text-gray-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-600">No execution logs yet</p>
              <p className="text-base mt-2 text-gray-500">Run a workflow to see execution details</p>
            </div>
          ) : (
            <div className="p-3 space-y-2 relative">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 backdrop-blur-sm transition-all duration-200 hover:shadow-sm border border-white/40"
                >
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {log.stepName && (
                        <span className="text-base font-medium text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                          {log.stepName}
                        </span>
                      )}
                      <span className="text-base text-gray-400">
                        {log.timestamp}
                      </span>
                      {log.executionTime !== undefined && (
                        <span className="text-base text-gray-500 bg-blue-100/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {log.executionTime < 1000
                            ? `${log.executionTime}ms`
                            : `${(log.executionTime / 1000).toFixed(2)}s`}
                        </span>
                      )}
                    </div>
                    <p className={`text-base ${getLogTextColor(log.type)}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};