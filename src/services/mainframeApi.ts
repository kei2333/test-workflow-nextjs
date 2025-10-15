/**
 * Mainframe API Service
 * Provides interface to s3270-based IBM mainframe backend
 */

// Get the current host dynamically for network access
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current window host but with backend port
    const hostname = window.location.hostname;
    return `http://${hostname}:5001/api`;
  }
  // Server-side fallback
  return 'http://localhost:5001/api';
};

const BASE_URL = getBaseUrl();

export interface ConnectionRequest {
  host: string;
  port?: number;
}

export interface ConnectionResponse {
  success: boolean;
  session_id?: string;
  message: string;
  host: string;
  port: number;
}

export interface LoginRequest {
  session_id: string;
  username: string;
  password: string;
  login_type?: 'standard' | 'tso';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  screen_content?: string;
}

export interface ScreenResponse {
  success: boolean;
  screen_content: string;
  connected: boolean;
  logged_in: boolean;
}

export interface CommandRequest {
  session_id: string;
  command: string;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  command?: string;
  screen_content?: string;
}

export interface HealthResponse {
  success: boolean;
  status: string;
  s3270_available: boolean;
  active_sessions: number;
}

export interface SessionInfo {
  session_id: string;
  host: string;
  port: number;
  connected: boolean;
  logged_in: boolean;
  created_at: string;
}

export interface SessionsResponse {
  success: boolean;
  sessions: SessionInfo[];
}

export interface SendFileRequest {
  session_id: string;
  local_path: string;
  mainframe_dataset: string;
  transfer_mode?: 'ascii' | 'binary';
}

export interface SendFileResponse {
  success: boolean;
  message: string;
  bytes_transferred?: number;
  screen_content?: string;
}

export interface GetFileRequest {
  session_id: string;
  mainframe_dataset: string;
  local_path: string;
  transfer_mode?: 'ascii' | 'binary';
}

export interface GetFileResponse {
  success: boolean;
  message: string;
  bytes_received?: number;
  local_path?: string;
}

export interface SubmitJclRequest {
  session_id: string;
  jcl_dataset_name: string;
}

export interface SubmitJclResponse {
  success: boolean;
  message: string;
  job_id?: string;
  screen_content?: string;
}

export interface JobStatusRequest {
  session_id: string;
  job_identifier?: string;
  max_attempts?: number;
  wait_seconds?: number;
}

export interface JobStatusResponse {
  success: boolean;
  message: string;
  job_identifier?: string;
  job_state?: string;
  attempts?: number;
  reached_output_queue?: boolean;
  screen_content?: string;
  history?: Array<{ attempt: string; screen_content: string }>;
}

export interface JobOutputRequest {
  session_id: string;
  job_identifier?: string;
  max_pages?: number;
}

export interface JobOutputResponse {
  success: boolean;
  message: string;
  job_identifier?: string;
  cond_code?: string;
  pages?: number;
  output_path?: string;
  screen_content?: string;
  output_excerpt?: string;
}

class MainframeApiService {
  /**
   * Check if the backend service is healthy and available
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      return await response.json();
    } catch {
      return {
        success: false,
        status: 'error',
        s3270_available: false,
        active_sessions: 0
      };
    }
  }

  /**
   * Connect to a mainframe host using s3270
   */
  async connect(request: ConnectionRequest): Promise<ConnectionResponse> {
    try {
      const response = await fetch(`${BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        host: request.host,
        port: request.port || 23,
      };
    }
  }

  /**
   * Login to mainframe with credentials
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get current screen content
   */
  async getScreen(sessionId: string): Promise<ScreenResponse> {
    try {
      const response = await fetch(`${BASE_URL}/screen?session_id=${sessionId}`);
      return await response.json();
    } catch {
      return {
        success: false,
        screen_content: '',
        connected: false,
        logged_in: false,
      };
    }
  }

  /**
   * Send a command to the mainframe
   */
  async sendCommand(request: CommandRequest): Promise<CommandResponse> {
    try {
      const response = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Command error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Logout from mainframe (proper logout sequence for real mainframe)
   */
  async logout(sessionId: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Disconnect from mainframe
   */
  async disconnect(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Disconnect error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * List all active sessions
   */
  async listSessions(): Promise<SessionsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/sessions`);
      return await response.json();
    } catch {
      return {
        success: false,
        sessions: [],
      };
    }
  }

  /**
   * Send file from Windows to Mainframe using IND$FILE
   */
  async sendFile(request: SendFileRequest): Promise<SendFileResponse> {
    try {
      const response = await fetch(`${BASE_URL}/sendfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Send file error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get file from Mainframe to Windows using IND$FILE
   */
  async getFile(request: GetFileRequest): Promise<GetFileResponse> {
    try {
      const response = await fetch(`${BASE_URL}/getfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Get file error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Submit JCL job from ISPF main menu
   */
  async submitJcl(request: SubmitJclRequest): Promise<SubmitJclResponse> {
    try {
      const response = await fetch(`${BASE_URL}/submit_jcl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Submit JCL error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Poll job status from the READY prompt
   */
  async checkJobStatus(request: JobStatusRequest): Promise<JobStatusResponse> {
    try {
      const response = await fetch(`${BASE_URL}/job_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Job status error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Retrieve job output and store it on the backend
   */
  async getJobOutput(request: JobOutputRequest): Promise<JobOutputResponse> {
    try {
      const response = await fetch(`${BASE_URL}/job_output`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Job output error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Cleanup all active sessions - useful for debugging and preventing connection leaks
   */
  async cleanupAllSessions(): Promise<{ success: boolean; message: string; cleaned_count: number }> {
    try {
      const response = await fetch(`${BASE_URL}/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        cleaned_count: 0,
      };
    }
  }
}

// Export singleton instance
export const mainframeApi = new MainframeApiService();
export default mainframeApi;