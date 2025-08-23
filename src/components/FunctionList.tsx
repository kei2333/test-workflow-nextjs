import React from 'react';
import { FunctionData } from '@/types/workflow';

interface FunctionListProps {
  functions: FunctionData[];
  onDragStart: (e: React.DragEvent, functionId: string) => void;
  onAddFunction: () => void;
  onEditFunction: (func: FunctionData) => void;
  onDeleteFunction: (id: string) => void;
  isLoading: boolean;
}

export const FunctionList: React.FC<FunctionListProps> = ({
  functions,
  onDragStart,
  onAddFunction,
  onEditFunction,
  onDeleteFunction,
  isLoading
}) => {
  const handleDeleteClick = async (func: FunctionData) => {
    const confirmed = window.confirm(`Are you sure you want to delete &quot;${func.name}&quot;? This action cannot be undone.`);
    if (confirmed) {
      onDeleteFunction(func.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col h-full">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Loading functions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" aria-hidden="true"></div>
          Functions
        </h2>
        <button
          onClick={onAddFunction}
          onKeyDown={(e) => handleKeyDown(e, onAddFunction)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          title="Add new function"
          aria-label="Add new function"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add
        </button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto" role="list" aria-label="Available functions">
        {functions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>No functions available</p>
            <p className="text-sm">Click &quot;Add&quot; to create your first function</p>
          </div>
        ) : (
          functions.map((func) => (
            <div
              key={func.id}
              className="group bg-white border-2 border-emerald-200 hover:border-emerald-400 p-5 rounded-2xl shadow-md hover:shadow-lg transform transition-all duration-300 relative overflow-hidden flex-shrink-0"
              role="listitem"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/60 to-emerald-50/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" aria-hidden="true"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div 
                  draggable
                  onDragStart={(e) => onDragStart(e, func.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // For keyboard users, we could trigger a different action like selecting the function
                    }
                  }}
                  className="flex-1 text-emerald-700 hover:text-emerald-800 font-semibold text-center cursor-grab active:cursor-grabbing hover:scale-105 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded"
                  tabIndex={0}
                  role="button"
                  aria-label={`Drag ${func.name} function to workflow. Description: ${func.description}`}
                  title={`${func.name}: ${func.description}`}
                >
                  {func.name}
                </div>
                
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => onEditFunction(func)}
                    onKeyDown={(e) => handleKeyDown(e, () => onEditFunction(func))}
                    className="w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    title={`Edit ${func.name} function`}
                    aria-label={`Edit ${func.name} function`}
                  >
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(func)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleDeleteClick(func))}
                    className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                    title={`Delete ${func.name} function`}
                    aria-label={`Delete ${func.name} function`}
                  >
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};