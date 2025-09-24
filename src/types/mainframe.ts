/**
 * Mainframe-related type definitions
 */

export interface MainframeState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;

  // Session info
  sessionId: string | null;
  host: string | null;
  port: number | null;

  // Authentication state
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  username: string | null;

  // Screen content
  screenContent: string;
  lastActivity: string | null;

  // Error handling
  error: string | null;

  // Backend availability
  serviceAvailable: boolean | null;
}

export interface ConnectionConfig {
  host: string;
  port: number;
}

export interface LoginCredentials {
  session_id: string;
  username: string;
  password: string;
}

export interface MainframeCommand {
  session_id: string;
  command: string;
}

export interface S3270Config {
  model: string;
  scriptMode: boolean;
  host?: string;
  port?: number;
}

export interface MainframeSession {
  id: string;
  host: string;
  port: number;
  connected: boolean;
  logged_in: boolean;
  created_at: string;
  last_activity?: string;
}