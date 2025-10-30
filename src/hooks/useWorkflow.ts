import React, { useState, useCallback } from 'react';
import { WorkflowItem, FunctionData } from '@/types/workflow';

interface UseWorkflowReturn {
  workflowItems: WorkflowItem[];
  addWorkflowItem: (functionData: FunctionData, inputs: Record<string, string>, insertIndex?: number) => void;
  updateWorkflowItem: (id: string, inputs: Record<string, string>) => void;
  removeWorkflowItem: (id: string) => void;
  clearWorkflow: () => void;
  reorderWorkflowItems: (fromIndex: number, toIndex: number) => void;
  saveWorkflow: (name: string) => void;
  loadWorkflow: (workflow: WorkflowItem[]) => void;
}

export const useWorkflow = (): UseWorkflowReturn => {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const colorCounterRef = React.useRef(0); // Track color assignment order

  const addWorkflowItem = useCallback((
    functionData: FunctionData,
    inputs: Record<string, string>,
    insertIndex?: number
  ) => {
    const newWorkflowItem: WorkflowItem = {
      id: `${functionData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: functionData.name,
      functionId: functionData.id,
      inputs: { ...inputs },
      colorIndex: colorCounterRef.current % 5 // Assign color based on order (0-4)
    };

    colorCounterRef.current += 1; // Increment counter for next item

    setWorkflowItems(prev => {
      const newItems = [...prev];
      const index = insertIndex !== undefined ? insertIndex : newItems.length;
      newItems.splice(index, 0, newWorkflowItem);
      return newItems;
    });
  }, []);

  const updateWorkflowItem = useCallback((id: string, inputs: Record<string, string>) => {
    setWorkflowItems(prev => prev.map(item =>
      item.id === id ? { ...item, inputs: { ...inputs } } : item
    ));
  }, []);

  const removeWorkflowItem = useCallback((id: string) => {
    setWorkflowItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearWorkflow = useCallback(() => {
    setWorkflowItems([]);
  }, []);

  const reorderWorkflowItems = useCallback((fromIndex: number, toIndex: number) => {
    console.log('📦 reorderWorkflowItems called - fromIndex:', fromIndex, 'toIndex:', toIndex);
    setWorkflowItems(prev => {
      console.log('📦 reorderWorkflowItems - prev items:', prev.map(item => item.name));
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      console.log('📦 reorderWorkflowItems - movedItem:', movedItem?.name);
      newItems.splice(toIndex, 0, movedItem);
      console.log('📦 reorderWorkflowItems - new items:', newItems.map(item => item.name));
      return newItems;
    });
  }, []);

  const saveWorkflow = useCallback((name: string) => {
    const workflow = {
      name,
      items: workflowItems,
      createdAt: new Date().toISOString()
    };
    
    try {
      const savedWorkflows = JSON.parse(localStorage.getItem('saved-workflows') || '[]');
      savedWorkflows.push(workflow);
      localStorage.setItem('saved-workflows', JSON.stringify(savedWorkflows));
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  }, [workflowItems]);

  const loadWorkflow = useCallback((workflow: WorkflowItem[]) => {
    setWorkflowItems(workflow);
  }, []);

  return {
    workflowItems,
    addWorkflowItem,
    updateWorkflowItem,
    removeWorkflowItem,
    clearWorkflow,
    reorderWorkflowItems,
    saveWorkflow,
    loadWorkflow
  };
};