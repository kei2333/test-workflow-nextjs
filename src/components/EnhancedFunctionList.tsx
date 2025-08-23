import React from 'react';
import { FunctionData } from '@/types/workflow';

interface EnhancedFunctionListProps {
  functions: FunctionData[];
  onDragStart: (e: React.DragEvent, functionId: string) => void;
  onAddFunction: () => void;
  onEditFunction: (func: FunctionData) => void;
  onDeleteFunction: (id: string) => void;
  isLoading: boolean;
}

export const EnhancedFunctionList: React.FC<EnhancedFunctionListProps> = ({
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

  // 按功能类型分组
  const groupedFunctions = functions.reduce((groups, func) => {
    let category = 'Other';
    if (func.id.includes('logon') || func.id.includes('ispf')) category = 'Authentication';
    else if (func.id.includes('jcl') || func.id.includes('exec')) category = 'Job Management';
    else if (func.id.includes('file')) category = 'File Operations';
    else if (func.id.includes('comp')) category = 'Comparison';

    if (!groups[category]) groups[category] = [];
    groups[category].push(func);
    return groups;
  }, {} as Record<string, FunctionData[]>);

  if (isLoading) {
    return (
      <div className="w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 flex flex-col h-full">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full bg-blue-100/20 animate-pulse"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading functions...</p>
            <p className="text-base text-gray-400 mt-1">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Functions
          </h2>
          <span className="text-base text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {functions.length}
          </span>
        </div>
        <button
          onClick={onAddFunction}
          onKeyDown={(e) => handleKeyDown(e, onAddFunction)}
          className="group inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-blue-600 hover:via-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 text-base shadow-md"
          title="Add new function"
          aria-label="Add new function"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add
        </button>
      </div>
      
      {/* Functions by Category */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent px-2" role="list" aria-label="Available functions">
        {functions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No functions available</p>
            <p className="text-base text-gray-400">Click &quot;Add&quot; to create your first function</p>
          </div>
        ) : (
          Object.entries(groupedFunctions).map(([category, categoryFunctions]) => (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center gap-2 px-1">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1"></div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {category}
                </span>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1"></div>
              </div>
              
              {/* Functions in Category */}
              <div className="space-y-1">
                {categoryFunctions.map((func) => (
                  <div
                    key={func.id}
                    className="group relative bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/60 hover:border-blue-300/60 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-1 p-2.5 mx-1 rounded-lg shadow-sm hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                    role="listitem"
                    tabIndex={0}
                  >
                    {/* Subtle background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-emerald-50/30 to-teal-50/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div 
                          draggable
                          onDragStart={(e) => onDragStart(e, func.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              // For keyboard users, we could trigger a different action
                            }
                          }}
                          className="cursor-grab active:cursor-grabbing focus:outline-none rounded-lg p-1 -m-1"
                          role="button"
                          aria-label={`Drag ${func.name} function to workflow. Description: ${func.description}`}
                          title={`Drag to add: ${func.name}`}
                        >
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-1 text-base">
                            {func.name}
                          </h3>
                          <p className="text-base text-gray-500 group-hover:text-gray-600 transition-colors truncate">
                            {func.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => onEditFunction(func)}
                          onKeyDown={(e) => handleKeyDown(e, () => onEditFunction(func))}
                          className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          title={`Edit ${func.name} function`}
                          aria-label={`Edit ${func.name} function`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(func)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleDeleteClick(func))}
                          className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-1 focus:ring-red-400"
                          title={`Delete ${func.name} function`}
                          aria-label={`Delete ${func.name} function`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};