import React from 'react';
import { WorkflowItem } from '@/types/workflow';
import { ExecutionProgress } from '@/services/functionExecutor';

interface WorkflowCanvasProps {
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

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
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
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'running':
        return (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
          Test Workflow
        </h2>
        <div className="flex items-center gap-4">
          {executionProgress && (
            <div className="text-sm text-gray-600 font-medium">
              Step {executionProgress.currentStep} of {executionProgress.totalSteps}
            </div>
          )}
          <button
            onClick={onRunWorkflow}
            onKeyDown={(e) => handleKeyDown(e, onRunWorkflow)}
            disabled={isRunning || workflowItems.length === 0}
            className={`
              px-8 py-4 rounded-2xl font-bold text-white text-lg
              transform transition-all duration-300 shadow-lg
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              ${isRunning 
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                : workflowItems.length === 0
                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl active:scale-95'
              }
            `}
            aria-label={workflowItems.length === 0 ? 'Add functions to workflow before running' : 'Run workflow'}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                Running...
              </span>
            ) : (
              'Run Workflow'
            )}
          </button>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`
          flex-1 min-h-0 border-2 border-dashed rounded-3xl p-8
          transition-all duration-300 relative
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
          ${draggedFunction 
            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50' 
            : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-100'
          }
        `}
        role="main"
        aria-label="Workflow canvas - drop functions here to build your workflow"
        tabIndex={0}
      >
        {workflowItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <p className="text-gray-500 text-xl font-medium mb-2">
              Drop functions here
            </p>
            <p className="text-gray-400">
              Create your test workflow by dragging functions from the left panel
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto" role="list" aria-label="Workflow steps">
            <div className="space-y-4">
              {workflowItems.map((item, index) => {
                const status = getItemStatus(index);
                return (
                  <React.Fragment key={item.id}>
                    {/* Insertion indicator */}
                    {dragOverIndex === index && (
                      <div 
                        className="h-1 bg-emerald-400 rounded-full mx-4 opacity-80 animate-pulse" 
                        aria-hidden="true"
                      ></div>
                    )}
                    
                    <div
                      onDragOver={(e) => onItemDragOver(e, index)}
                      onDrop={(e) => onItemDrop(e, index)}
                      className={`
                        group p-6 rounded-2xl flex items-center justify-between shadow-xl 
                        transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl 
                        relative overflow-hidden
                        ${status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600' 
                          : status === 'running'
                            ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-600'
                            : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600'
                        } text-white
                      `}
                      role="listitem"
                      aria-label={`Step ${index + 1}: ${item.name}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" aria-hidden="true"></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/30">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{item.name}</span>
                          {getItemStatusIcon(status)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, () => onRemoveItem(item.id))}
                        disabled={isRunning}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-110 active:scale-95 relative z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-500"
                        title={`Remove ${item.name} from workflow`}
                        aria-label={`Remove ${item.name} from workflow`}
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Insertion indicator at the end */}
                    {dragOverIndex === workflowItems.length && index === workflowItems.length - 1 && (
                      <div 
                        className="h-1 bg-emerald-400 rounded-full mx-4 opacity-80 animate-pulse" 
                        aria-hidden="true"
                      ></div>
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