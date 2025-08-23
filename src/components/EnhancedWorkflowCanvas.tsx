import React from 'react';
import { WorkflowItem } from '@/types/workflow';
import { ExecutionProgress } from '@/services/functionExecutor';

interface EnhancedWorkflowCanvasProps {
  workflowItems: WorkflowItem[];
  draggedFunction: string;
  dragOverIndex: number | null;
  executionProgress: ExecutionProgress | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onItemDragOver: (e: React.DragEvent, index: number) => void;
  onItemDrop: (e: React.DragEvent, index: number) => void;
  onRemoveItem: (id: string) => void;
  onRunWorkflow: () => void;
  isRunning: boolean;
}

export const EnhancedWorkflowCanvas: React.FC<EnhancedWorkflowCanvasProps> = ({
  workflowItems,
  draggedFunction,
  dragOverIndex,
  executionProgress,
  onDragOver,
  onDrop,
  onItemDragOver,
  onItemDrop,
  onRemoveItem,
  onRunWorkflow,
  isRunning
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const getItemStatus = (index: number) => {
    if (!executionProgress) return 'pending';
    if (executionProgress.currentStep > index + 1) return 'completed';
    if (executionProgress.currentStep === index + 1) return 'running';
    return 'pending';
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'running':
        return (
          <div className="w-5 h-5 relative">
            <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 border-2 border-white/50 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white/70 rounded-full"></div>
          </div>
        );
    }
  };

  const getItemBackgroundGradient = (status: string, index: number) => {
    const baseGradients = [
      'from-blue-500 via-blue-600 to-indigo-600',
      'from-emerald-500 via-teal-600 to-cyan-600',
      'from-emerald-500 via-emerald-600 to-teal-600',
      'from-amber-500 via-orange-500 to-red-500',
      'from-indigo-500 via-blue-500 to-sky-600'
    ];
    
    switch (status) {
      case 'completed':
        return 'from-green-500 via-green-600 to-emerald-600';
      case 'running':
        return 'from-yellow-400 via-orange-500 to-red-500';
      default:
        return baseGradients[index % baseGradients.length];
    }
  };

  return (
    <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Test Workflow
          </h2>
          
          {executionProgress && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-base font-medium text-blue-700">
                Step {executionProgress.currentStep} of {executionProgress.totalSteps}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={onRunWorkflow}
          onKeyDown={(e) => handleKeyDown(e, onRunWorkflow)}
          disabled={isRunning || workflowItems.length === 0}
          className={`
            group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white text-base
            transform transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1
            ${isRunning 
              ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed focus:ring-gray-400' 
              : workflowItems.length === 0
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed focus:ring-gray-400'
                : 'bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-600 hover:from-blue-600 hover:via-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-xl active:scale-95 focus:ring-blue-400'
            }
          `}
          aria-label={workflowItems.length === 0 ? 'Add functions to workflow before running' : 'Run workflow'}
        >
          {isRunning ? (
            <>
              <div className="relative">
                <div className="w-4 h-4 border-2 border-white/30 rounded-full"></div>
                <div className="absolute inset-0 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              Running...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Workflow
            </>
          )}
        </button>
      </div>

      {/* Canvas */}
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`
          flex-1 min-h-0 border-2 border-dashed rounded-3xl p-6 relative
          transition-all duration-300 
          ${draggedFunction 
            ? 'border-blue-400 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 shadow-inner' 
            : 'border-gray-200 bg-gradient-to-br from-gray-50/30 to-slate-50/50'
          }
        `}
        role="main"
        aria-label="Workflow canvas - drop functions here to build your workflow"
        tabIndex={0}
      >
        {/* Enhanced drag overlay effect */}
        {draggedFunction && (
          <div className="absolute inset-0 z-50 rounded-2xl">
            {/* Background overlay to hide underlying content */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-cyan-50/85 backdrop-blur-md rounded-2xl"></div>
            
            {/* Main drag overlay */}
            <div className="absolute inset-2 border-3 border-dashed border-blue-400 rounded-2xl bg-gradient-to-br from-blue-50/60 via-cyan-50/40 to-emerald-50/30 flex items-center justify-center pointer-events-none animate-pulse">
              <div className="text-center relative z-10">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 rounded-2xl mx-auto opacity-30 animate-ping"></div>
                </div>
                <p className="text-lg font-semibold bg-gradient-to-r from-blue-700 via-cyan-700 to-emerald-700 bg-clip-text text-transparent">
                  Drop here to add function
                </p>
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {workflowItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              Drop functions here
            </h3>
            <p className="text-lg text-gray-500 max-w-sm">
              Create your test workflow by dragging functions from the left panel
            </p>
            <div className="mt-4 flex items-center gap-2 text-base text-gray-400">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-ping"></div>
              <span>Drag & drop to get started</span>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent px-2" role="list" aria-label="Workflow steps">
            <div className="space-y-4 pb-4 px-1">
              {workflowItems.map((item, index) => {
                const status = getItemStatus(index);
                return (
                  <React.Fragment key={item.id}>
                    {/* Insertion indicator */}
                    {dragOverIndex === index && (
                      <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full mx-4 opacity-80 animate-pulse shadow-lg"></div>
                    )}
                    
                    <div
                      onDragOver={(e) => onItemDragOver(e, index)}
                      onDrop={(e) => onItemDrop(e, index)}
                      className={`
                        group relative p-5 rounded-2xl flex items-center justify-between
                        transform transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl
                        bg-gradient-to-r ${getItemBackgroundGradient(status, index)} text-white
                        ${status === 'running' ? 'animate-pulse' : ''}
                      `}
                      role="listitem"
                      aria-label={`Step ${index + 1}: ${item.name}`}
                    >
                      {/* Background animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center font-bold text-lg border border-white/30">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl">{item.name}</h3>
                            {Object.keys(item.inputs).length > 0 && (
                              <p className="text-base text-white/80">
                                {Object.keys(item.inputs).length} parameters configured
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-auto">
                          {getItemStatusIcon(status)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, () => onRemoveItem(item.id))}
                        disabled={isRunning}
                        className="w-8 h-8 bg-red-500/80 hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-110 active:scale-95 relative z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-red-500 shadow-lg"
                        title={`Remove ${item.name} from workflow`}
                        aria-label={`Remove ${item.name} from workflow`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Connection line */}
                    {index < workflowItems.length - 1 && (
                      <div className="flex justify-center">
                        <div className="w-px h-4 bg-gradient-to-b from-gray-300 to-gray-200"></div>
                      </div>
                    )}
                    
                    {/* Final insertion indicator */}
                    {dragOverIndex === workflowItems.length && index === workflowItems.length - 1 && (
                      <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full mx-4 opacity-80 animate-pulse shadow-lg mt-4"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};