'use client';

import React, { useState } from 'react';

interface WorkflowItem {
  id: string;
  name: string;
  functionId: string;
  inputs: Record<string, string>;
}

interface FunctionInput {
  name: string;
  placeholder: string;
}

const functions = [
  { 
    id: 'logonspf', 
    name: 'LogonSPF', 
    description: 'Mainframe Connectivity',
    inputs: [
      { name: 'User Name', placeholder: 'XYZ' },
      { name: 'Password', placeholder: '****' },
      { name: 'Mainframe location', placeholder: 'folder path' }
    ]
  },
  { 
    id: 'editjcl', 
    name: 'EditJCL', 
    description: 'Job Edit',
    inputs: [
      { name: 'JCL Name', placeholder: 'JCL1(SHIPPRATEST.JCL1)' },
      { name: 'String to be found1', placeholder: 'abc1(&date)' },
      { name: 'String to be replaced1', placeholder: 'xyz1(250806)' },
      { name: 'String to be found2', placeholder: 'abc2' },
      { name: 'String to be replaced2', placeholder: 'xyz2' }
    ]
  },
  { 
    id: 'execjcl', 
    name: 'ExecJCL', 
    description: 'Job Execution',
    inputs: [
      { name: 'JCL Name', placeholder: 'JCL1(SHIPPRATEST.JCL1)' }
    ]
  },
  { 
    id: 'executioncheck', 
    name: 'ExecutionCheck', 
    description: 'Check Job Status',
    inputs: [
      { name: 'Job Name', placeholder: 'JOBABCA1' },
      { name: 'Job Run Date', placeholder: 'Date' }
    ]
  },
  { 
    id: 'getjoblog', 
    name: 'GetJobLog', 
    description: 'Get Job Log',
    inputs: [
      { name: 'Job Name', placeholder: 'JOBABCA1' },
      { name: 'Job Run Date', placeholder: 'Date' }
    ]
  },
  { 
    id: 'filecomp1', 
    name: 'FileComp1', 
    description: 'File Comparison',
    inputs: [
      { name: 'File Name1', placeholder: 'File1' },
      { name: 'Windows File Location1', placeholder: 'File location' },
      { name: 'File Name2', placeholder: 'File2' },
      { name: 'Windows File Location2', placeholder: 'File location' }
    ]
  },
  { 
    id: 'filecomp2', 
    name: 'FileComp2', 
    description: 'File Comparison',
    inputs: [
      { name: 'File Name1', placeholder: 'File1' },
      { name: 'Windows File Location', placeholder: 'File location' },
      { name: 'Field1 Condition', placeholder: 'Value' },
      { name: 'Field2 Condition', placeholder: 'Value' }
    ]
  },
];

export default function Home() {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedFunction, setDraggedFunction] = useState<string>('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [pendingFunction, setPendingFunction] = useState<any>(null);
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

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
      setPendingFunction(functionData);
      setPendingInsertIndex(workflowItems.length);
      
      // Initialize input values with placeholders
      const initialInputs: Record<string, string> = {};
      functionData.inputs.forEach(input => {
        initialInputs[input.name] = input.placeholder;
      });
      setInputValues(initialInputs);
      setShowInputModal(true);
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
      const boundingRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseY = e.clientY;
      const itemCenterY = boundingRect.top + boundingRect.height / 2;
      const insertIndex = mouseY < itemCenterY ? index : index + 1;
      
      setPendingFunction(functionData);
      setPendingInsertIndex(insertIndex);
      
      // Initialize input values with placeholders
      const initialInputs: Record<string, string> = {};
      functionData.inputs.forEach(input => {
        initialInputs[input.name] = input.placeholder;
      });
      setInputValues(initialInputs);
      setShowInputModal(true);
    }
    
    setDraggedFunction('');
    setDragOverIndex(null);
  };

  const removeFromWorkflow = (id: string) => {
    setWorkflowItems(workflowItems.filter(item => item.id !== id));
  };

  const handleInputChange = (inputName: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [inputName]: value
    }));
  };

  const confirmAddFunction = () => {
    if (pendingFunction && pendingInsertIndex !== null) {
      const newWorkflowItem: WorkflowItem = {
        id: `${pendingFunction.id}-${Date.now()}`,
        name: pendingFunction.name,
        functionId: pendingFunction.id,
        inputs: { ...inputValues }
      };
      
      const newItems = [...workflowItems];
      newItems.splice(pendingInsertIndex, 0, newWorkflowItem);
      setWorkflowItems(newItems);
    }
    setShowInputModal(false);
    setPendingFunction(null);
    setPendingInsertIndex(null);
    setInputValues({});
  };

  const cancelAddFunction = () => {
    setShowInputModal(false);
    setPendingFunction(null);
    setPendingInsertIndex(null);
    setInputValues({});
  };

  const executeFunction = (functionId: string, functionName: string, inputs: Record<string, string>) => {
    switch (functionId) {
      case 'logonspf':
        return `${functionName}: Successfully connected to mainframe with credentials. User ${inputs['User Name'] || 'XYZ'} logged in at ${inputs['Mainframe location'] || 'folder path'}.`;
      case 'editjcl':
        return `${functionName}: JCL file '${inputs['JCL Name'] || 'JCL1'}' edited successfully. Found '${inputs['String to be found1'] || 'abc1(&date)'}' and replaced with '${inputs['String to be replaced1'] || 'xyz1(250806)'}.`;
      case 'execjcl':
        return `${functionName}: JCL job '${inputs['JCL Name'] || 'JCL1(SHIPPRATEST.JCL1)'}' submitted successfully. Job execution started.`;
      case 'executioncheck':
        return `${functionName}: Job status checked. Job '${inputs['Job Name'] || 'JOBABCA1'}' execution status retrieved from spool on ${inputs['Job Run Date'] || 'Date'}.`;
      case 'getjoblog':
        return `${functionName}: Job log retrieved successfully for '${inputs['Job Name'] || 'JOBABCA1'}' on ${inputs['Job Run Date'] || 'Date'}. Log file generated using GetFile from mainframe.`;
      case 'filecomp1':
        return `${functionName}: File comparison completed. Compared '${inputs['File Name1'] || 'File1'}' at '${inputs['Windows File Location1'] || 'File location'}' and '${inputs['File Name2'] || 'File2'}' at '${inputs['Windows File Location2'] || 'File location'}'. Files compared and differences identified.`;
      case 'filecomp2':
        return `${functionName}: File comparison with conditions completed. Verified '${inputs['File Name1'] || 'File1'}' for expected values. Field1 condition '${inputs['Field1 Condition'] || 'Value'}' and Field2 condition '${inputs['Field2 Condition'] || 'Value'}' checked. Differences mentioned.`;
      default:
        return `${functionName}: Function executed successfully`;
    }
  };

  const runWorkflow = async () => {
    if (workflowItems.length === 0) {
      alert('Please add functions to your workflow before running.');
      return;
    }

    setIsRunning(true);
    
    for (let i = 0; i < workflowItems.length; i++) {
      const currentItem = workflowItems[i];
      await new Promise(resolve => setTimeout(resolve, 1500));
      const message = executeFunction(currentItem.functionId, currentItem.name, currentItem.inputs);
      alert(`Step ${i + 1}: ${message}`);
    }
    
    alert('Workflow execution completed successfully!');
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

      {/* Input Modal */}
      {showInputModal && pendingFunction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Configure {pendingFunction.name}
            </h3>
            <p className="text-gray-600 text-center mb-8">{pendingFunction.description}</p>
            
            <div className="space-y-6">
              {pendingFunction.inputs.map((input: FunctionInput) => (
                <div key={input.name} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {input.name}
                  </label>
                  <input
                    type="text"
                    value={inputValues[input.name] || ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={cancelAddFunction}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddFunction}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105"
              >
                Add Function
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
