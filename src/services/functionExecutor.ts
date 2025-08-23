import { WorkflowItem } from '@/types/workflow';
import { sanitizeInput } from '@/utils/validation';

export interface ExecutionResult {
  success: boolean;
  message: string;
  step: number;
  functionName: string;
  executionTime: number;
}

export interface ExecutionProgress {
  currentStep: number;
  totalSteps: number;
  isRunning: boolean;
  results: ExecutionResult[];
}

export class FunctionExecutor {
  private static readonly STEP_DELAY = 1500; // ms between steps

  static async executeWorkflow(
    workflowItems: WorkflowItem[],
    onProgress?: (progress: ExecutionProgress) => void
  ): Promise<ExecutionResult[]> {
    if (workflowItems.length === 0) {
      throw new Error('Workflow is empty');
    }

    const results: ExecutionResult[] = [];
    const totalSteps = workflowItems.length;

    for (let i = 0; i < workflowItems.length; i++) {
      const item = workflowItems[i];
      const startTime = Date.now();
      
      // Update progress
      if (onProgress) {
        onProgress({
          currentStep: i + 1,
          totalSteps,
          isRunning: true,
          results: [...results]
        });
      }

      try {
        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, this.STEP_DELAY));
        
        const message = this.executeFunction(item.functionId, item.name, item.inputs);
        const executionTime = Date.now() - startTime;

        const result: ExecutionResult = {
          success: true,
          message,
          step: i + 1,
          functionName: item.name,
          executionTime
        };

        results.push(result);

      } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        const result: ExecutionResult = {
          success: false,
          message: `Failed to execute ${item.name}: ${errorMessage}`,
          step: i + 1,
          functionName: item.name,
          executionTime
        };

        results.push(result);
        
        // Stop execution on first failure
        break;
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        currentStep: totalSteps,
        totalSteps,
        isRunning: false,
        results
      });
    }

    return results;
  }

  private static executeFunction(
    functionId: string, 
    functionName: string, 
    inputs: Record<string, string>
  ): string {
    // Sanitize all inputs
    const sanitizedInputs: Record<string, string> = {};
    Object.keys(inputs).forEach(key => {
      sanitizedInputs[key] = sanitizeInput(inputs[key] || '');
    });

    // Execute based on function ID
    switch (functionId) {
      case 'logonispf':
        return `${functionName}: Successfully connected to mainframe with credentials. User ${sanitizedInputs['User Name'] || 'XYZ'} logged in successfully.`;
      
      case 'editjcl':
        return `${functionName}: JCL file '${sanitizedInputs['JCL Name'] || 'JCL1'}' edited successfully. Found '${sanitizedInputs['String to be found1- Find string1'] || 'abc1(&date)'}' and replaced with '${sanitizedInputs['String to be replaced1- replace string1'] || 'xyz1(250806)'}'.`;
      
      case 'execjcl':
        return `${functionName}: JCL job '${sanitizedInputs['JCL Name'] || 'JCL1(SHIPPRATEST.JCL1)'}' submitted successfully. Job execution started.`;
      
      case 'executioncheck':
        return `${functionName}: Job status checked. Job '${sanitizedInputs['Job Name'] || 'JOBABCA1'}' execution status retrieved from spool on ${sanitizedInputs['Job Run Date'] || 'Date'}.`;
      
      case 'getjoblog':
        return `${functionName}: Job log retrieved successfully for '${sanitizedInputs['Job Name'] || 'JOBABCA1'}' on ${sanitizedInputs['Job Run Date'] || 'Date'}'. Log file generated using GetFile from mainframe.`;
      
      case 'filecomp1':
        return `${functionName}: File comparison completed. Compared '${sanitizedInputs['File Name1'] || 'File1'}' at '${sanitizedInputs['Windows File Location1'] || 'File location'}' and '${sanitizedInputs['File Name2'] || 'File2'}' at '${sanitizedInputs['Windows File Location2'] || 'File location'}'. Files compared and differences identified.`;
      
      case 'filecomp2':
        return `${functionName}: File comparison with conditions completed. Verified '${sanitizedInputs['File Name1'] || 'File1'}' for expected values. Field1 '${sanitizedInputs['Field1 Name'] || 'Value'}' expected '${sanitizedInputs['Field1 Expected Value'] || 'Value'}' and Field2 '${sanitizedInputs['Field2 Name'] || 'Value'}' expected '${sanitizedInputs['Field2 Expected Value'] || 'Value'}' checked. Differences mentioned.`;
      
      case 'createfile':
        return `${functionName}: File created successfully. Created '${sanitizedInputs['File Name'] || 'File1'}' at '${sanitizedInputs['File Location on windows'] || 'Location'}' using copybook '${sanitizedInputs['Copybook Name'] || 'Layout Name'}'. Key field '${sanitizedInputs['Key Field-1-Name'] || 'Value'}' set to '${sanitizedInputs['Key Field-1-Value'] || 'Value'}'. File edited as per conditions.`;
      
      case 'sendfile':
        return `${functionName}: File transfer completed successfully. Transferred '${sanitizedInputs['Windows File name'] || 'File1'}' from '${sanitizedInputs['Windows File Location'] || 'File location'}' to mainframe file '${sanitizedInputs['Mainframe File Name'] || 'File2(SHIPRA.TEST.FILE2)'}'. Return message for successful data transfer.`;
      
      case 'getfile':
        return `${functionName}: File import completed successfully. Retrieved '${sanitizedInputs['Mainframe File Name'] || 'File2(SHIPRA.TEST.FILE2)'}' to '${sanitizedInputs['Windows File name'] || 'File1'}' at '${sanitizedInputs['Windows File Location'] || 'File location'}'. Return message for successful data transfer.`;
      
      case 'fileconv':
        return `${functionName}: File conversion completed successfully. Converted text file '${sanitizedInputs['Text file name in windows'] || 'File1'}' to Excel file '${sanitizedInputs['Excel file name'] || 'File3'}' using copybook '${sanitizedInputs['Copybook name in windows'] || 'File2'}'. File converted to excel as per copybook layout.`;
      
      case 'gotoispfmainscreen':
        return `${functionName}: Successfully returned to ISPF main screen. Pre-requisite is that LogonISPF should be true.`;
      
      case 'filereccount':
        return `${functionName}: Record count retrieved successfully. File '${sanitizedInputs['Mainframe File Name1'] || 'File1(SHIPRA.TEST.FILE1)'}' contains record count. Can be used to verify empty files.`;
      
      default:
        return `${functionName}: Function executed successfully with provided inputs.`;
    }
  }
}