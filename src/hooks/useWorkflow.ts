import { useState, useCallback } from 'react';
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

  const addWorkflowItem = useCallback((
    functionData: FunctionData, 
    inputs: Record<string, string>, 
    insertIndex?: number
  ) => {
    const newWorkflowItem: WorkflowItem = {
      id: `${functionData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: functionData.name,
      functionId: functionData.id,
      inputs: { ...inputs }
    };

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
    setWorkflowItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
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