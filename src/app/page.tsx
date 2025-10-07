'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FunctionData } from '@/types/workflow';
import { EnhancedFunctionList } from '@/components/EnhancedFunctionList';
import { EnhancedWorkflowCanvas } from '@/components/EnhancedWorkflowCanvas';
import { InputConfigModal } from '@/components/InputConfigModal';
import { FunctionManagementModal } from '@/components/FunctionManagementModal';
import { useFunctions } from '@/hooks/useFunctions';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useExecutionLog } from '@/hooks/useExecutionLog';
import { FunctionExecutor, ExecutionProgress } from '@/services/functionExecutor';

export default function Home() {
  // Custom hooks
  const {
    functions,
    isLoading,
    error: functionsError,
    addFunction,
    updateFunction,
    deleteFunction
  } = useFunctions();

  const {
    workflowItems,
    addWorkflowItem,
    removeWorkflowItem
  } = useWorkflow();

  // Removed notification system - using execution log only

  const {
    logs,
    addLog,
    clearLogs
  } = useExecutionLog();

  // State for drag and drop
  const [draggedFunction, setDraggedFunction] = useState<string>('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // State for modals
  const [showInputModal, setShowInputModal] = useState(false);
  const [showAddFunctionModal, setShowAddFunctionModal] = useState(false);
  const [showEditFunctionModal, setShowEditFunctionModal] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionData | null>(null);
  const [pendingFunction, setPendingFunction] = useState<FunctionData | null>(null);
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | null>(null);

  // State for workflow execution
  const [executionProgress, setExecutionProgress] = useState<ExecutionProgress | null>(null);

  // State for mainframe connection
  const [isMainframeConnected, setIsMainframeConnected] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Ref for auto-scrolling logs
  const logEndRef = useRef<HTMLDivElement>(null);

  // Show error logs for functions API
  React.useEffect(() => {
    if (functionsError) {
      addLog('error', functionsError);
    }
  }, [functionsError, addLog]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current && logs.length > 0) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Check mainframe connection status on mount and when session changes
  useEffect(() => {
    const checkConnection = () => {
      const sessionId = localStorage.getItem('mainframe-session-id');
      setIsMainframeConnected(!!sessionId);
    };

    checkConnection();

    // Check periodically
    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle mainframe disconnect
  const handleMainframeDisconnect = useCallback(async () => {
    const sessionId = localStorage.getItem('mainframe-session-id');
    if (!sessionId) {
      addLog('warning', 'No active mainframe session found');
      return;
    }

    setIsDisconnecting(true);
    addLog('info', 'Disconnecting from mainframe...');

    try {
      // Import mainframeApi dynamically to avoid circular dependencies
      const { mainframeApi } = await import('@/services/mainframeApi');

      // Get login type from localStorage to determine if we need to logout first
      const loginType = localStorage.getItem('mainframe-login-type');

      // For TSO login, perform logout first
      if (loginType === 'tso') {
        try {
          const logoutResult = await mainframeApi.logout(sessionId);
          if (logoutResult.success) {
            addLog('success', 'Logged out from TSO session');
          }
        } catch (logoutError) {
          addLog('warning', 'Logout failed, continuing with disconnect');
        }
      }

      // Disconnect the session
      const disconnectResult = await mainframeApi.disconnect(sessionId);

      if (disconnectResult.success) {
        addLog('success', 'Disconnected from mainframe successfully');
      } else {
        addLog('warning', `Disconnect completed: ${disconnectResult.message}`);
      }

      // Clear session data from localStorage
      localStorage.removeItem('mainframe-session-id');
      localStorage.removeItem('mainframe-login-type');
      setIsMainframeConnected(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Failed to disconnect: ${errorMessage}`);
    } finally {
      setIsDisconnecting(false);
    }
  }, [addLog]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, functionId: string) => {
    setDraggedFunction(functionId);
    e.dataTransfer.setData('text/plain', functionId);
    
    // Create custom drag image
    const draggedFunc = functions.find(f => f.id === functionId);
    if (draggedFunc) {
      const dragImage = document.createElement('div');
      dragImage.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        background: linear-gradient(135deg, #3B82F6, #06B6D4, #10B981);
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(8px);
        max-width: 200px;
      `;
      dragImage.textContent = draggedFunc.name;
      document.body.appendChild(dragImage);
      
      e.dataTransfer.setDragImage(dragImage, 100, 20);
      
      // Clean up after drag starts
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  }, [functions]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const functionId = e.dataTransfer.getData('text/plain');
    const functionData = functions.find(f => f.id === functionId);
    
    if (functionData) {
      setPendingFunction(functionData);
      setPendingInsertIndex(workflowItems.length);
      setShowInputModal(true);
    }
    setDraggedFunction('');
    setDragOverIndex(null);
  }, [functions, workflowItems.length]);

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const boundingRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseY = e.clientY;
    const itemCenterY = boundingRect.top + boundingRect.height / 2;
    
    const insertIndex = mouseY < itemCenterY ? index : index + 1;
    setDragOverIndex(insertIndex);
  }, []);

  const handleItemDrop = useCallback((e: React.DragEvent, index: number) => {
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
      setShowInputModal(true);
    }
    
    setDraggedFunction('');
    setDragOverIndex(null);
  }, [functions]);

  // Modal handlers
  const handleInputConfirm = useCallback((inputs: Record<string, string>) => {
    if (pendingFunction && pendingInsertIndex !== null) {
      addWorkflowItem(pendingFunction, inputs, pendingInsertIndex);
      addLog('success', `${pendingFunction.name} added to workflow`);
    }
    setShowInputModal(false);
    setPendingFunction(null);
    setPendingInsertIndex(null);
  }, [pendingFunction, pendingInsertIndex, addWorkflowItem, addLog]);

  const handleInputCancel = useCallback(() => {
    setShowInputModal(false);
    setPendingFunction(null);
    setPendingInsertIndex(null);
  }, []);

  // Function management handlers
  const handleAddNewFunction = useCallback(() => {
    setEditingFunction(null);
    setShowAddFunctionModal(true);
  }, []);

  const handleEditFunction = useCallback((func: FunctionData) => {
    setEditingFunction(func);
    setShowEditFunctionModal(true);
  }, []);

  const handleDeleteFunction = useCallback(async (id: string) => {
    const success = await deleteFunction(id);
    if (success) {
      addLog('info', `Function deleted successfully`);
    } else {
      addLog('error', 'Failed to delete function');
    }
  }, [deleteFunction, addLog]);

  const handleSaveFunction = useCallback(async (functionData: FunctionData): Promise<boolean> => {
    const success = editingFunction
      ? await updateFunction(functionData)
      : await addFunction(functionData);

    if (success) {
      addLog('success', `Function ${editingFunction ? 'updated' : 'added'} successfully`);
      setShowAddFunctionModal(false);
      setShowEditFunctionModal(false);
      setEditingFunction(null);
    } else {
      addLog('error', `Failed to ${editingFunction ? 'update' : 'add'} function`);
    }

    return success;
  }, [editingFunction, addFunction, updateFunction, addLog]);

  // Workflow execution
  const handleRunWorkflow = useCallback(async () => {
    if (workflowItems.length === 0) {
      addLog('warning', 'Please add functions to your workflow before running');
      return;
    }

    // Clear previous logs and start logging
    clearLogs();
    addLog('info', '🚀 Starting workflow execution...');

    try {
      const results = await FunctionExecutor.executeWorkflow(
        workflowItems,
        (progress) => {
          setExecutionProgress(progress);
          if (progress.currentStep <= workflowItems.length) {
            const currentItem = workflowItems[progress.currentStep - 1];
            addLog('info', `⏳ Executing step ${progress.currentStep} of ${progress.totalSteps}...`, currentItem?.name);
          }
        }
      );

      // Log results (only in execution log, avoid duplicate notifications)
      results.forEach((result, index) => {
        const stepName = workflowItems[index]?.name;
        if (result.success) {
          addLog('success', result.message, stepName);
        } else {
          addLog('error', result.message, stepName);
        }
      });

      const successCount = results.filter(r => r.success).length;
      const totalSteps = results.length;
      
      if (successCount === totalSteps) {
        addLog('success', `✅ Workflow completed successfully! All ${totalSteps} steps executed.`);
        // Success already logged in execution log
      } else {
        addLog('warning', `⚠️ Workflow completed with issues: ${successCount}/${totalSteps} steps succeeded.`);
        // Warning already logged in execution log
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLog('error', `❌ Failed to execute workflow: ${errorMessage}`);
    } finally {
      setExecutionProgress(null);
    }
  }, [workflowItems, addLog, clearLogs]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent">
              Test Workflow Generator
            </h1>
            <div className="flex items-center gap-3 text-base text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>{functions.length} Functions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span>{workflowItems.length} Steps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                <span>{logs.length} Logs</span>
              </div>
            </div>
          </div>

          {/* Mainframe Controls */}
          <div className="flex items-center gap-3">
            {/* Disconnect Button - only show when connected */}
            {isMainframeConnected && (
              <button
                onClick={handleMainframeDisconnect}
                disabled={isDisconnecting}
                className="group flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                title="Disconnect from mainframe"
              >
                {isDisconnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                    </svg>
                    <span>Disconnect</span>
                  </>
                )}
              </button>
            )}

            {/* Mainframe Terminal Button */}
            <Link
              href="/mainframe"
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span>Mainframe Terminal</span>
              {isMainframeConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected"></div>
              )}
            </Link>
          </div>
        </div>
        
        <div className="flex gap-3 h-[calc(100vh-100px)]" role="main">
          {/* Functions Panel */}
          <div className="w-80">
            <EnhancedFunctionList
              functions={functions}
              onDragStart={handleDragStart}
              onAddFunction={handleAddNewFunction}
              onEditFunction={handleEditFunction}
              onDeleteFunction={handleDeleteFunction}
              isLoading={isLoading}
            />
          </div>

          {/* Workflow Canvas */}
          <div className="flex-1">
            <EnhancedWorkflowCanvas
              workflowItems={workflowItems}
              draggedFunction={draggedFunction}
              dragOverIndex={dragOverIndex}
              executionProgress={executionProgress}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onItemDragOver={handleItemDragOver}
              onItemDrop={handleItemDrop}
              onRemoveItem={removeWorkflowItem}
              onRunWorkflow={handleRunWorkflow}
              isRunning={!!executionProgress?.isRunning}
            />
          </div>

          {/* Execution Log Panel */}
          <div className="w-80">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 h-full relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 via-transparent to-emerald-100/10 pointer-events-none"></div>
              
              {/* Header */}
              <div className="relative flex items-center justify-between p-3 border-b border-gray-200/50">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Execution Log</h3>
                  <span className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-200/50">
                    {logs.length}
                  </span>
                </div>
                
                <button
                  onClick={clearLogs}
                  className="px-2 py-1 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50/80 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105"
                  title="Clear logs"
                >
                  Clear
                </button>
              </div>

              {/* Log Content */}
              <div className="h-[calc(100%-60px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 via-cyan-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-cyan-200/20 to-emerald-200/20"></div>
                      <svg className="w-6 h-6 text-gray-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No logs yet</p>
                    <p className="text-xs mt-1 text-gray-500">Run workflow to see details</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2 relative">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/60 backdrop-blur-sm transition-all duration-200 border border-white/40"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {log.type === 'success' && (
                            <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {log.type === 'error' && (
                            <div className="w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {log.type === 'warning' && (
                            <div className="w-3 h-3 bg-yellow-100 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {log.type === 'info' && (
                            <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {log.stepName && (
                              <span className="text-xs font-medium text-gray-600 bg-gray-200/60 px-1.5 py-0.5 rounded">
                                {log.stepName}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {log.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">
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
        </div>

        {/* Modals */}
        <InputConfigModal
          isOpen={showInputModal}
          onClose={handleInputCancel}
          onConfirm={handleInputConfirm}
          functionData={pendingFunction}
        />

        <FunctionManagementModal
          isOpen={showAddFunctionModal}
          onClose={() => setShowAddFunctionModal(false)}
          onSave={handleSaveFunction}
          editingFunction={null}
          mode="add"
        />

        <FunctionManagementModal
          isOpen={showEditFunctionModal}
          onClose={() => setShowEditFunctionModal(false)}
          onSave={handleSaveFunction}
          editingFunction={editingFunction}
          mode="edit"
        />
      </div>
    </div>
  );
}