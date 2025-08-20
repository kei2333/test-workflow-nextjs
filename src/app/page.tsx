'use client';

import React, { useState, useEffect } from 'react';

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

interface FunctionData {
  id: string;
  name: string;
  description: string;
  inputs: FunctionInput[];
}

export default function Home() {
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [draggedFunction, setDraggedFunction] = useState<string>('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [pendingFunction, setPendingFunction] = useState<FunctionData | null>(null);
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  
  // 函数管理状态
  const [showAddFunctionModal, setShowAddFunctionModal] = useState(false);
  const [showEditFunctionModal, setShowEditFunctionModal] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionData | null>(null);
  const [functionFormData, setFunctionFormData] = useState({
    id: '',
    name: '',
    description: '',
    numberOfInputs: 0
  });
  const [functionInputs, setFunctionInputs] = useState<FunctionInput[]>([]);

  // 加载函数数据
  const loadFunctions = async () => {
    try {
      const response = await fetch('/api/functions');
      if (response.ok) {
        const data = await response.json();
        setFunctions(data);
      }
    } catch (error) {
      console.error('Failed to load functions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFunctions();
  }, []);

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

  // 函数管理相关方法
  const resetFunctionForm = () => {
    setFunctionFormData({ id: '', name: '', description: '', numberOfInputs: 0 });
    setFunctionInputs([]);
    setEditingFunction(null);
  };

  const handleAddNewFunction = () => {
    resetFunctionForm();
    setShowAddFunctionModal(true);
  };

  const handleEditFunction = (func: FunctionData) => {
    setEditingFunction(func);
    setFunctionFormData({
      id: func.id,
      name: func.name,
      description: func.description,
      numberOfInputs: func.inputs.length
    });
    setFunctionInputs([...func.inputs]);
    setShowEditFunctionModal(true);
  };

  const handleDeleteFunction = async (id: string) => {
    if (confirm('Are you sure you want to delete this function?')) {
      try {
        const response = await fetch(`/api/functions?id=${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await loadFunctions();
          alert('Function deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete function:', error);
        alert('Failed to delete function');
      }
    }
  };

  const handleFunctionInputCountChange = (count: number) => {
    const newInputs = [...functionInputs];
    
    if (count > functionInputs.length) {
      for (let i = functionInputs.length; i < count; i++) {
        newInputs.push({ name: '', placeholder: '' });
      }
    } else if (count < functionInputs.length) {
      newInputs.splice(count);
    }
    
    setFunctionInputs(newInputs);
    setFunctionFormData(prev => ({ ...prev, numberOfInputs: count }));
  };

  const updateFunctionInput = (index: number, field: 'name' | 'placeholder', value: string) => {
    const newInputs = [...functionInputs];
    newInputs[index][field] = value;
    setFunctionInputs(newInputs);
  };

  const handleSaveFunction = async () => {
    if (!functionFormData.name.trim() || !functionFormData.id.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    for (let i = 0; i < functionInputs.length; i++) {
      if (!functionInputs[i].name.trim() || !functionInputs[i].placeholder.trim()) {
        alert(`Please fill in all content for input field ${i + 1}`);
        return;
      }
    }

    const functionData: FunctionData = {
      id: functionFormData.id,
      name: functionFormData.name,
      description: functionFormData.description,
      inputs: functionInputs
    };

    try {
      const response = await fetch('/api/functions', {
        method: editingFunction ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionData)
      });

      if (response.ok) {
        await loadFunctions();
        setShowAddFunctionModal(false);
        setShowEditFunctionModal(false);
        resetFunctionForm();
        alert(`Function ${editingFunction ? 'updated' : 'added'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Save failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to save function:', error);
      alert('Failed to save function');
    }
  };

  const executeFunction = (functionId: string, functionName: string, inputs: Record<string, string>) => {
    switch (functionId) {
      case 'logonispf':
        return `${functionName}: Successfully connected to mainframe with credentials. User ${inputs['User Name'] || 'XYZ'} logged in successfully.`;
      case 'editjcl':
        return `${functionName}: JCL file '${inputs['JCL Name'] || 'JCL1'}' edited successfully. Found '${inputs['String to be found1- Find string1'] || 'abc1(&date)'}' and replaced with '${inputs['String to be replaced1- replace string1'] || 'xyz1(250806)'}.`;
      case 'execjcl':
        return `${functionName}: JCL job '${inputs['JCL Name'] || 'JCL1(SHIPPRATEST.JCL1)'}' submitted successfully. Job execution started.`;
      case 'executioncheck':
        return `${functionName}: Job status checked. Job '${inputs['Job Name'] || 'JOBABCA1'}' execution status retrieved from spool on ${inputs['Job Run Date'] || 'Date'}.`;
      case 'getjoblog':
        return `${functionName}: Job log retrieved successfully for '${inputs['Job Name'] || 'JOBABCA1'}' on ${inputs['Job Run Date'] || 'Date'}. Log file generated using GetFile from mainframe.`;
      case 'filecomp1':
        return `${functionName}: File comparison completed. Compared '${inputs['File Name1'] || 'File1'}' at '${inputs['Windows File Location1'] || 'File location'}' and '${inputs['File Name2'] || 'File2'}' at '${inputs['Windows File Location2'] || 'File location'}'. Files compared and differences identified.`;
      case 'filecomp2':
        return `${functionName}: File comparison with conditions completed. Verified '${inputs['File Name1'] || 'File1'}' for expected values. Field1 '${inputs['Field1 Name'] || 'Value'}' expected '${inputs['Field1 Expected Value'] || 'Value'}' and Field2 '${inputs['Field2 Name'] || 'Value'}' expected '${inputs['Field2 Expected Value'] || 'Value'}' checked. Differences mentioned.`;
      case 'createfile':
        return `${functionName}: File created successfully. Created '${inputs['File Name'] || 'File1'}' at '${inputs['File Location on windows'] || 'Location'}' using copybook '${inputs['Copybook Name'] || 'Layout Name'}'. Key field '${inputs['Key Field-1-Name'] || 'Value'}' set to '${inputs['Key Field-1-Value'] || 'Value'}'. File edited as per conditions.`;
      case 'sendfile':
        return `${functionName}: File transfer completed successfully. Transferred '${inputs['Windows File name'] || 'File1'}' from '${inputs['Windows File Location'] || 'File location'}' to mainframe file '${inputs['Mainframe File Name'] || 'File2(SHIPRA.TEST.FILE2)'}'. Return message for successful data transfer.`;
      case 'getfile':
        return `${functionName}: File import completed successfully. Retrieved '${inputs['Mainframe File Name'] || 'File2(SHIPRA.TEST.FILE2)'}' to '${inputs['Windows File name'] || 'File1'}' at '${inputs['Windows File Location'] || 'File location'}'. Return message for successful data transfer.`;
      case 'fileconv':
        return `${functionName}: File conversion completed successfully. Converted text file '${inputs['Text file name in windows'] || 'File1'}' to Excel file '${inputs['Excel file name'] || 'File3'}' using copybook '${inputs['Copybook name in windows'] || 'File2'}'. File converted to excel as per copybook layout.`;
      case 'gotoispfmainscreen':
        return `${functionName}: Successfully returned to ISPF main screen. Pre-requisite is that LogonISPF should be true.`;
      case 'filereccount':
        return `${functionName}: Record count retrieved successfully. File '${inputs['Mainframe File Name1'] || 'File1(SHIPRA.TEST.FILE1)'}' contains record count. Can be used to verify empty files.`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading functions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Test Workflow Generator
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Drag and drop functions to create powerful test workflows
          </p>
        </div>
        
        <div className="flex gap-8 h-[calc(100vh-190px)]">
          {/* Left Panel - Functions */}
          <div className="w-80 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                Functions
              </h2>
              <button
                onClick={handleAddNewFunction}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-md text-sm"
                title="Add new function"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add
              </button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {functions.map((func) => (
                <div
                  key={func.id}
                  className="group bg-white border-2 border-emerald-200 hover:border-emerald-400 p-5 rounded-2xl shadow-md hover:shadow-lg transform transition-all duration-300 relative overflow-hidden flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/60 to-emerald-50/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, func.id)}
                      className="flex-1 text-emerald-700 hover:text-emerald-800 font-semibold text-center cursor-grab active:cursor-grabbing hover:scale-105 py-1"
                    >
                      {func.name}
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditFunction(func)}
                        className="w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                        title="Edit function"
                      >
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteFunction(func.id)}
                        className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                        title="Delete function"
                      >
                        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
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

        {/* Input Modal */}
        {showInputModal && pendingFunction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                Configure {pendingFunction.name}
              </h3>
              <p className="text-gray-600 text-center mb-8">{pendingFunction.description}</p>
              
              <div className="space-y-6">
                {pendingFunction.inputs.map((input) => (
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


        {/* Add Function Modal */}
        {showAddFunctionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                Add New Function
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Function Name *
                    </label>
                    <input
                      type="text"
                      value={functionFormData.name}
                      onChange={(e) => setFunctionFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="MyFunction"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Function ID *
                    </label>
                    <input
                      type="text"
                      value={functionFormData.id}
                      onChange={(e) => setFunctionFormData(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="myfunction"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={functionFormData.description}
                    onChange={(e) => setFunctionFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Function description"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Input Fields
                  </label>
                  <input
                    type="number"
                    value={functionFormData.numberOfInputs}
                    onChange={(e) => handleFunctionInputCountChange(parseInt(e.target.value) || 0)}
                    min="0"
                    max="20"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                {functionInputs.map((input, index) => (
                  <div key={index} className="border-2 border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Input Field {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Field Name *
                        </label>
                        <input
                          type="text"
                          value={input.name}
                          onChange={(e) => updateFunctionInput(index, 'name', e.target.value)}
                          placeholder="Field name"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Placeholder *
                        </label>
                        <input
                          type="text"
                          value={input.placeholder}
                          onChange={(e) => updateFunctionInput(index, 'placeholder', e.target.value)}
                          placeholder="Placeholder text"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowAddFunctionModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFunction}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105"
                >
                  Add Function
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Function Modal */}
        {showEditFunctionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                Edit Function
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Function Name *
                    </label>
                    <input
                      type="text"
                      value={functionFormData.name}
                      onChange={(e) => setFunctionFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Function ID *
                    </label>
                    <input
                      type="text"
                      value={functionFormData.id}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={functionFormData.description}
                    onChange={(e) => setFunctionFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Input Fields
                  </label>
                  <input
                    type="number"
                    value={functionFormData.numberOfInputs}
                    onChange={(e) => handleFunctionInputCountChange(parseInt(e.target.value) || 0)}
                    min="0"
                    max="20"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                  />
                </div>

                {functionInputs.map((input, index) => (
                  <div key={index} className="border-2 border-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Input Field {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Field Name *
                        </label>
                        <input
                          type="text"
                          value={input.name}
                          onChange={(e) => updateFunctionInput(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Placeholder *
                        </label>
                        <input
                          type="text"
                          value={input.placeholder}
                          onChange={(e) => updateFunctionInput(index, 'placeholder', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowEditFunctionModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFunction}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  Update Function
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}