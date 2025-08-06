'use client';

import React, { useState } from 'react';

interface WorkflowItem {
  id: string;
  name: string;
  functionId: string;
}

const functions = [
  { id: 'function1', name: 'Function1' },
  { id: 'function2', name: 'Function2' },
  { id: 'function3', name: 'Function3' },
  { id: 'function4', name: 'Function4' },
  { id: 'function5', name: 'Function5' },
];

export default function Home() {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedFunction, setDraggedFunction] = useState<string>('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, functionId: string) => {
    setDraggedFunction(functionId);
    e.dataTransfer.setData('text/plain', functionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const functionId = e.dataTransfer.getData('text/plain');
    const functionData = functions.find(f => f.id === functionId);
    
    if (functionData) {
      const newWorkflowItem: WorkflowItem = {
        id: `${functionData.id}-${Date.now()}`,
        name: functionData.name,
        functionId: functionData.id,
      };
      setWorkflowItems([...workflowItems, newWorkflowItem]);
    }
    setDraggedFunction('');
    setDragOverIndex(null);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const boundingRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseY = e.clientY;
    const itemCenterY = boundingRect.top + boundingRect.height / 2;
    
    // Determine if we should insert before or after this item
    const insertIndex = mouseY < itemCenterY ? index : index + 1;
    setDragOverIndex(insertIndex);
  };

  const handleItemDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const functionId = e.dataTransfer.getData('text/plain');
    const functionData = functions.find(f => f.id === functionId);
    
    if (functionData) {
      const newWorkflowItem: WorkflowItem = {
        id: `${functionData.id}-${Date.now()}`,
        name: functionData.name,
        functionId: functionData.id,
      };
      
      const boundingRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseY = e.clientY;
      const itemCenterY = boundingRect.top + boundingRect.height / 2;
      
      // Insert before or after based on mouse position
      const insertIndex = mouseY < itemCenterY ? index : index + 1;
      const newItems = [...workflowItems];
      newItems.splice(insertIndex, 0, newWorkflowItem);
      setWorkflowItems(newItems);
    }
    
    setDraggedFunction('');
    setDragOverIndex(null);
  };

  const removeFromWorkflow = (id: string) => {
    setWorkflowItems(workflowItems.filter(item => item.id !== id));
  };

  const runWorkflow = async () => {
    if (workflowItems.length === 0) {
      alert('Please add functions to your workflow before running.');
      return;
    }

    setIsRunning(true);
    
    for (let i = 0; i < workflowItems.length; i++) {
      const currentItem = workflowItems[i];
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Test ${i + 1}: ${currentItem.name} has been executed`);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Test Workflow Generator
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Drag and drop functions to create powerful test workflows
          </p>
        </div>
        
        <div className="flex gap-8 h-[calc(100vh-120px)]">
          {/* Left Panel - Functions */}
          <div className="w-80 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              Functions
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {functions.map((func) => (
                <div
                  key={func.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, func.id)}
                  className="group bg-white border-2 border-emerald-200 hover:border-emerald-400 text-emerald-700 hover:text-emerald-800 p-5 rounded-2xl font-semibold text-center shadow-md hover:shadow-lg transform transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-105 hover:-rotate-1 relative overflow-hidden flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/60 to-emerald-50/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  <span className="relative z-10">{func.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Workflow */}
          <div className="flex-1 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Test Workflow
              </h2>
              <button
                onClick={runWorkflow}
                disabled={isRunning}
                className={`
                  px-8 py-4 rounded-2xl font-bold text-white text-lg
                  transform transition-all duration-300 shadow-lg
                  ${isRunning 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-2xl active:scale-95'
                  }
                `}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Running...
                  </span>
                ) : (
                  'Run Workflow'
                )}
              </button>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                flex-1 min-h-0 border-2 border-dashed rounded-3xl p-8
                transition-all duration-300 relative
                ${draggedFunction 
                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50' 
                  : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-100'
                }
              `}
            >
              {workflowItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
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
                <div className="h-full overflow-y-auto">
                  <div className="space-y-4">
                    {workflowItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        {/* Insertion indicator */}
                        {dragOverIndex === index && (
                          <div className="h-1 bg-emerald-400 rounded-full mx-4 opacity-80 animate-pulse"></div>
                        )}
                        
                        <div
                          onDragOver={(e) => handleItemDragOver(e, index)}
                          onDrop={(e) => handleItemDrop(e, index)}
                          className="group bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white p-6 rounded-2xl flex items-center justify-between shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/30">
                              {index + 1}
                            </div>
                            <span className="font-bold text-lg">{item.name}</span>
                          </div>
                          <button
                            onClick={() => removeFromWorkflow(item.id)}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-110 active:scale-95 relative z-10"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Insertion indicator at the end */}
                        {dragOverIndex === workflowItems.length && index === workflowItems.length - 1 && (
                          <div className="h-1 bg-emerald-400 rounded-full mx-4 opacity-80 animate-pulse"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
