export interface FunctionInput {
  name: string;
  placeholder: string;
  defaultValue?: string;
  type?: 'text' | 'radio';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

export interface FunctionData {
  id: string;
  name: string;
  description: string;
  inputs: FunctionInput[];
}

export interface WorkflowItem {
  id: string;
  name: string;
  functionId: string;
  inputs: Record<string, string>;
}

export interface FunctionFormData {
  id: string;
  name: string;
  description: string;
  numberOfInputs: number;
}

export interface APIError {
  error: string;
  details?: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}