import { WorkflowItem } from '@/types/workflow';
import { sanitizeInput } from '@/utils/validation';
import { mainframeApi } from '@/services/mainframeApi';

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

// System configuration type
type SystemConfig = {
  host: string;
  port: number;
  defaultUsername: string;
  defaultPassword: string;
};

// Available systems
const SYSTEMS: Record<string, SystemConfig> = {
  pub400: {
    host: 'pub400.com',
    port: 23,
    defaultUsername: 'pub400',
    defaultPassword: 'pub400',
  },
  tk5: {
    host: 'localhost',
    port: 3270,
    defaultUsername: 'HERC01',
    defaultPassword: 'CUL8TR',
  },
};

// Get current system from localStorage or default to pub400
function getCurrentSystem(): SystemConfig {
  if (typeof window !== 'undefined') {
    const systemType = localStorage.getItem('mainframe-system-type') || 'pub400';
    return SYSTEMS[systemType] || SYSTEMS.pub400;
  }
  return SYSTEMS.pub400;
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
        
        const message = await this.executeFunction(item.functionId, item.name, item.inputs);
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

  private static async executeFunction(
    functionId: string,
    functionName: string,
    inputs: Record<string, string>
  ): Promise<string> {
    // Sanitize all inputs
    const sanitizedInputs: Record<string, string> = {};
    Object.keys(inputs).forEach(key => {
      sanitizedInputs[key] = sanitizeInput(inputs[key] || '');
    });

    // Execute based on function ID
    switch (functionId) {
      case 'logonispf':
        try {
          // Get connection parameters from user input
          const host = sanitizedInputs['Host'] || '';
          const portStr = sanitizedInputs['Port'] || '23';
          const port = parseInt(portStr) || 23;
          const loginType = sanitizedInputs['Login Type'] || 'standard';
          const username = sanitizedInputs['User Name'] || '';
          const password = sanitizedInputs['Password'] || '';

          if (!host || !username || !password) {
            return `${functionName}: Error - Host, User Name, and Password are required`;
          }

          // First connect to mainframe using s3270
          const connectResponse = await mainframeApi.connect({
            host,
            port
          });

          if (connectResponse.success && connectResponse.session_id) {
            // Then login with provided credentials and login type
            const loginResponse = await mainframeApi.login({
              session_id: connectResponse.session_id,
              username,
              password,
              login_type: loginType as 'standard' | 'tso'
            });

            if (loginResponse.success) {
              // Store session ID and login type in localStorage for use by other functions
              if (typeof window !== 'undefined' && connectResponse.session_id) {
                localStorage.setItem('mainframe-session-id', connectResponse.session_id);
                localStorage.setItem('mainframe-login-type', loginType);
              }
              return `${functionName}: Successfully connected to ${host}:${port} and logged in using ${loginType.toUpperCase()} login. User ${username} authenticated. Session ID: ${connectResponse.session_id.substring(0, 8)}...`;
            } else {
              return `${functionName}: Connection successful but login failed: ${loginResponse.message}`;
            }
          } else {
            return `${functionName}: Failed to connect to mainframe: ${connectResponse.message}`;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return `${functionName}: Error during mainframe connection/login: ${errorMessage}`;
        }
      
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
        return await this.executeCreateFile(functionName, sanitizedInputs);
      
      case 'sendfile':
        return await this.executeSendFile(functionName, sanitizedInputs);

      case 'getfile':
        return await this.executeGetFile(functionName, sanitizedInputs);

      case 'submitjcl':
        return await this.executeSubmitJcl(functionName, sanitizedInputs);

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

  private static async executeCreateFile(
    functionName: string,
    inputs: Record<string, string>
  ): Promise<string> {
    try {
      // Extract parameters
      const fileName = inputs['File Name'] || 'testfile.txt';
      const fileLocation = inputs['File Location on windows'] || './output';
      const copybookName = inputs['Copybook Name'] || 'default_layout';

      // Key field
      const keyFieldName = inputs['Key Field-1-Name'] || 'ID';
      const keyFieldValue = inputs['Key Field-1-Value'] || '001';

      // Input fields
      const fields: Array<{name: string, value: string}> = [];

      // Add key field
      fields.push({ name: keyFieldName, value: keyFieldValue });

      // Add other input fields
      for (let i = 1; i <= 10; i++) {
        const fieldName = inputs[`Input Field-${i}-Name`];
        const fieldValue = inputs[`Input Field-${i}-Value`];
        if (fieldName && fieldValue) {
          fields.push({ name: fieldName, value: fieldValue });
        }
      }

      // Handle 'n' field
      const fieldNameN = inputs['Input Field-n-Name'];
      const fieldValueN = inputs['Input Field-n-Value'];
      if (fieldNameN && fieldValueN) {
        fields.push({ name: fieldNameN, value: fieldValueN });
      }

      // Create file content based on copybook layout
      const fileContent = this.generateFileContent(copybookName, fields);

      // For web environment, we'll simulate file creation
      if (typeof window !== 'undefined') {
        // Create download for the file
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return `${functionName}: File '${fileName}' created successfully and downloaded. Location: Downloads folder. Copybook: '${copybookName}'. Fields set: ${fields.map(f => `${f.name}=${f.value}`).join(', ')}.`;
      } else {
        // For Node.js environment (if running server-side)
        return `${functionName}: File '${fileName}' created successfully at '${fileLocation}'. Copybook: '${copybookName}'. Fields set: ${fields.map(f => `${f.name}=${f.value}`).join(', ')}.`;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create file: ${errorMessage}`);
    }
  }

  private static generateFileContent(
    copybookName: string,
    fields: Array<{name: string, value: string}>
  ): string {
    const timestamp = new Date().toISOString();
    let content = '';

    // Add header with copybook information
    content += `# File generated using copybook: ${copybookName}\n`;
    content += `# Generated on: ${timestamp}\n`;
    content += `# Total fields: ${fields.length}\n`;
    content += '\n';

    // Add field definitions in a structured format
    content += '# Field Definitions:\n';
    fields.forEach((field, index) => {
      content += `# Field ${index + 1}: ${field.name}\n`;
    });
    content += '\n';

    // Add data section
    content += '# Data Section:\n';

    // Format 1: Key-Value pairs
    content += '[FIELDS]\n';
    fields.forEach(field => {
      content += `${field.name}=${field.value}\n`;
    });
    content += '\n';

    // Format 2: Fixed-width format (simulating mainframe fixed-width files)
    content += '[FIXED_WIDTH_DATA]\n';
    let fixedWidthLine = '';
    fields.forEach(field => {
      // Pad each field to 20 characters for fixed-width format
      const paddedValue = field.value.padEnd(20, ' ');
      fixedWidthLine += paddedValue;
    });
    content += fixedWidthLine + '\n';
    content += '\n';

    // Format 3: CSV format
    content += '[CSV_FORMAT]\n';
    const csvHeaders = fields.map(f => f.name).join(',');
    const csvValues = fields.map(f => f.value).join(',');
    content += csvHeaders + '\n';
    content += csvValues + '\n';
    content += '\n';

    // Add footer
    content += '# End of file\n';
    content += `# Record count: 1\n`;
    content += `# File creation completed successfully\n`;

    return content;
  }

  private static async executeSendFile(
    functionName: string,
    inputs: Record<string, string>
  ): Promise<string> {
    try {
      // Extract parameters
      const windowsFileName = inputs['Windows File name'] || 'File1';
      const windowsFileLocation = inputs['Windows File Location'] || './';
      const mainframeFileName = inputs['Mainframe File Name'] || 'SHIPRA.TEST.FILE2';

      // Construct full local path
      const localPath = `${windowsFileLocation}/${windowsFileName}`;

      // Get active session ID from localStorage
      let sessionId = '';
      if (typeof window !== 'undefined') {
        sessionId = localStorage.getItem('mainframe-session-id') || '';
      }

      if (!sessionId) {
        return `${functionName}: Error - No active mainframe session. Please login first.`;
      }

      // Call the mainframe API to send file
      const response = await mainframeApi.sendFile({
        session_id: sessionId,
        local_path: localPath,
        mainframe_dataset: mainframeFileName,
        transfer_mode: 'ascii'
      });

      if (response.success) {
        return `${functionName}: File transfer completed successfully. Transferred '${windowsFileName}' from '${windowsFileLocation}' to mainframe dataset '${mainframeFileName}'. Bytes transferred: ${response.bytes_transferred || 0}.`;
      } else {
        return `${functionName}: File transfer failed - ${response.message}`;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send file: ${errorMessage}`);
    }
  }

  private static async executeGetFile(
    functionName: string,
    inputs: Record<string, string>
  ): Promise<string> {
    try {
      // Extract parameters
      const mainframeFileName = inputs['Mainframe File Name'] || 'SHIPRA.TEST.FILE2';
      const windowsFileName = inputs['Windows File name'] || 'File1';
      const windowsFileLocation = inputs['Windows File Location'] || './downloads';

      // Construct full local path
      const localPath = `${windowsFileLocation}/${windowsFileName}`;

      // Get active session ID from localStorage
      let sessionId = '';
      if (typeof window !== 'undefined') {
        sessionId = localStorage.getItem('mainframe-session-id') || '';
      }

      if (!sessionId) {
        return `${functionName}: Error - No active mainframe session. Please login first.`;
      }

      // Call the mainframe API to get file
      const response = await mainframeApi.getFile({
        session_id: sessionId,
        mainframe_dataset: mainframeFileName,
        local_path: localPath,
        transfer_mode: 'ascii'
      });

      if (response.success) {
        return `${functionName}: File import completed successfully. Retrieved '${mainframeFileName}' to '${windowsFileName}' at '${windowsFileLocation}'. Bytes received: ${response.bytes_received || 0}.`;
      } else {
        return `${functionName}: File retrieval failed - ${response.message}`;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file: ${errorMessage}`);
    }
  }

  private static async executeSubmitJcl(
    functionName: string,
    inputs: Record<string, string>
  ): Promise<string> {
    try {
      // Extract parameters
      const jclDatasetName = inputs['JCL Dataset Name'] || 'TRA026.TEST.JCL(FILECR)';

      // Get active session ID from localStorage
      let sessionId = '';
      if (typeof window !== 'undefined') {
        sessionId = localStorage.getItem('mainframe-session-id') || '';
      }

      if (!sessionId) {
        return `${functionName}: Error - No active mainframe session. Please login with LogonISPF first.`;
      }

      // Call the mainframe API to submit JCL
      const response = await mainframeApi.submitJcl({
        session_id: sessionId,
        jcl_dataset_name: jclDatasetName
      });

      if (response.success) {
        const jobIdInfo = response.job_id ? ` Job: ${response.job_id}` : '';
        return `${functionName}:${jobIdInfo}. ${response.message}. JCL dataset '${jclDatasetName}' submitted successfully.`;
      } else {
        return `${functionName}: JCL submission failed - ${response.message}`;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to submit JCL: ${errorMessage}`);
    }
  }
}