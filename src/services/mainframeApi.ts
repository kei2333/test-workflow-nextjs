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

class MainframeApiService {
  /**
   * Check if the backend service is healthy and available
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      return await response.json();
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      return {
        success: false,
        sessions: [],
      };
    }
  }
}

// Export singleton instance
export const mainframeApi = new MainframeApiService();
export default mainframeApi;