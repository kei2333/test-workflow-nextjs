#!/usr/bin/env python3
"""
IBM Mainframe API Server with s3270 Integration
Provides real 3270 terminal emulation using s3270
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import subprocess
import time
from datetime import datetime
from typing import Dict, Optional, List, Tuple

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://192.168.2.109:3000"]}})

# Global sessions storage
sessions = {}

# Session timeout in seconds (30 minutes)
SESSION_TIMEOUT = 1800

def cleanup_expired_sessions():
    """Remove expired sessions"""
    current_time = datetime.now()
    expired_sessions = []

    for session_id, session_data in sessions.items():
        last_accessed = session_data.get('last_accessed', session_data['created_at'])
        age = (current_time - last_accessed).total_seconds()

        if age > SESSION_TIMEOUT:
            expired_sessions.append(session_id)

    for session_id in expired_sessions:
        try:
            print(f"Cleaning up expired session: {session_id}")
            session = sessions[session_id]['session']
            session.disconnect()
            del sessions[session_id]
        except Exception as e:
            print(f"Error cleaning up session {session_id}: {e}")

    return len(expired_sessions)

def update_session_access(session_id: str):
    """Update last accessed time for a session"""
    if session_id in sessions:
        sessions[session_id]['last_accessed'] = datetime.now()

class S3270Session:
    """s3270 session handler for IBM mainframe connections"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.host = None
        self.port = None
        self.is_connected = False
        self.is_logged_in = False
        self.created_at = datetime.now()
        self.process = None
        self.screen_buffer = ""
        self.last_command = ""

    def connect(self, host: str, port: int = 23) -> Tuple[bool, str]:
        """Connect to mainframe using s3270"""
        try:
            # Determine s3270 executable path based on OS
            s3270_paths = [
                r"C:\Program Files\wc3270\s3270.exe",  # Windows
                "/opt/homebrew/bin/s3270",              # macOS Homebrew
                "/usr/bin/s3270",                       # Linux
                "/usr/local/bin/s3270",                 # Alternative
                "s3270"                                 # PATH fallback
            ]
            s3270_exe = next((path for path in s3270_paths if os.path.exists(path)), "s3270")

            # Configure s3270 parameters based on target system
            if host == 'localhost' and port == 3270:
                # TK5/Hercules specific configuration
                s3270_cmd = [
                    s3270_exe,
                    '-model', '3278-2',   # Use older 3278 model for TK5
                    '-script',            # Enable scripting mode
                    '-connecttimeout', '30',  # Longer timeout for TK5
                    '-codepage', 'cp037', # Use EBCDIC code page
                    f'{host}:{port}'
                ]
            else:
                # Standard configuration for modern systems like pub400
                s3270_cmd = [
                    s3270_exe,
                    '-model', '3279-4',  # 3270 model 4 (43x80)
                    '-script',           # Enable scripting mode
                    f'{host}:{port}'
                ]

            self.process = subprocess.Popen(
                s3270_cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding='utf-8',
                errors='replace',  # Replace unencodable characters
                bufsize=0
            )

            # Wait a moment for connection to establish
            time.sleep(2)

            # Check if process is still running (successful connection)
            if self.process.poll() is None:
                self.host = host
                self.port = port
                self.is_connected = True

                # Get initial screen content with longer timeout for TK5
                timeout = 30 if host == 'localhost' and port == 3270 else 10
                initial_screen = self._execute_command('Ascii', timeout)

                return True, f"Successfully connected to {host}:{port} using s3270"
            else:
                stderr_output = self.process.stderr.read()
                return False, f"Connection failed: {stderr_output}"

        except Exception as e:
            return False, f"Connection error: {str(e)}"

    def _send_command(self, command: str, timeout: int = 10) -> Dict[str, str]:
        """Send command to s3270 process and get response"""
        if not self.process or self.process.poll() is not None:
            return {"status": "error", "data": "Connection lost"}

        try:
            # Send command to s3270
            self.process.stdin.write(f"{command}\n")
            self.process.stdin.flush()

            # Read response lines with timeout
            response_lines = []
            status = "ok"
            start_time = time.time()

            # Windows compatible non-blocking read
            while True:
                # Check for timeout
                if time.time() - start_time > timeout:
                    return {"status": "error", "data": f"Command timeout after {timeout}s"}

                # Try to read a line (blocking read with short timeout handled by readline)
                line = self.process.stdout.readline().strip()
                if not line:
                    # Small sleep to prevent busy waiting
                    time.sleep(0.01)
                    continue

                if line.startswith("ok"):
                    status = "ok"
                    break
                elif line.startswith("error"):
                    status = "error"
                    break
                elif line.startswith("data:"):
                    # This is data from the command
                    response_lines.append(line[5:].strip())  # Remove "data:" prefix
                else:
                    response_lines.append(line)

            return {
                "status": status,
                "data": "\n".join(response_lines) if response_lines else ""
            }
        except Exception as e:
            return {"status": "error", "data": f"Command error: {str(e)}"}

    def _execute_command(self, command: str, timeout: int = 10) -> str:
        """Execute a command and return just the data"""
        result = self._send_command(command, timeout)
        if result["status"] == "error":
            return f"Error: {result['data']}"
        return result["data"]

    def get_screen_text(self) -> str:
        """Get current screen content as text"""
        screen_content = self._execute_command('Ascii')
        return screen_content

    def login(self, username: str, password: str) -> Dict:
        """Perform login to mainframe"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Get current screen to see login prompt
            initial_screen = self.get_screen_text()
            # Safe print with encoding handling
            try:
                print(f"DEBUG: Initial screen content:\n{initial_screen}")
            except UnicodeEncodeError:
                print("DEBUG: Initial screen content received (contains special characters)")

            # TK5 specific login handling
            if self.host == 'localhost' and self.port == 3270:
                # For TK5, try different approach - it might need different login sequence
                # Type username directly without clearing first
                self._execute_command(f'String("{username}")')
                time.sleep(1)

                # Press Enter to submit username
                self._execute_command('Enter')
                time.sleep(2)

                # Get intermediate screen
                intermediate_screen = self.get_screen_text()
                try:
                    print(f"DEBUG: After username screen:\n{intermediate_screen}")
                except UnicodeEncodeError:
                    print("DEBUG: After username screen received")

                # Type password
                self._execute_command(f'String("{password}")')
                time.sleep(1)

                # Press Enter to submit password
                self._execute_command('Enter')
                time.sleep(3)
            else:
                # Standard login for other systems (like pub400)
                # Clear any existing input and enter username
                self._execute_command('Clear')
                time.sleep(0.5)

                # Type username
                self._execute_command(f'String("{username}")')
                time.sleep(0.5)

                # Press Tab or Enter to move to password field
                self._execute_command('Tab')
                time.sleep(0.5)

                # Type password
                self._execute_command(f'String("{password}")')
                time.sleep(0.5)

                # Press Enter to submit login
                self._execute_command('Enter')
                time.sleep(2)

            # Get screen after login attempt
            login_result_screen = self.get_screen_text()
            try:
                print(f"DEBUG: Final login screen:\n{login_result_screen}")
            except UnicodeEncodeError:
                print("DEBUG: Final login screen received")

            # Check for common success indicators in screen content
            success_indicators = ['READY', 'ISPF', 'MAIN MENU', 'TSO', 'LOGON', 'COMMAND', 'HERCULES']
            error_indicators = ['INVALID', 'ERROR', 'FAILED', 'INCORRECT', 'NOT AUTHORIZED']

            login_screen_upper = login_result_screen.upper()

            if any(indicator in login_screen_upper for indicator in success_indicators):
                self.is_logged_in = True
                return {
                    "success": True,
                    "message": "Login successful",
                    "screen_content": login_result_screen
                }
            elif any(indicator in login_screen_upper for indicator in error_indicators):
                return {
                    "success": False,
                    "message": "Login failed - invalid credentials",
                    "screen_content": login_result_screen
                }
            else:
                # Assume success if no explicit error
                self.is_logged_in = True
                return {
                    "success": True,
                    "message": "Login completed",
                    "screen_content": login_result_screen
                }

        except Exception as e:
            return {"success": False, "message": f"Login error: {str(e)}"}

    def send_command(self, command: str) -> Dict:
        """Send a command or text to mainframe"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Store the command for reference
            self.last_command = command

            # Send the command as a string
            self._execute_command(f'String("{command}")')
            time.sleep(0.5)

            # Press Enter to execute
            self._execute_command('Enter')
            time.sleep(1)

            # Get updated screen content
            screen_content = self.get_screen_text()

            return {
                "success": True,
                "message": "Command sent successfully",
                "command": command,
                "screen_content": screen_content
            }

        except Exception as e:
            return {"success": False, "message": f"Command error: {str(e)}"}


    def send_function_key(self, key: str) -> Dict:
        """Send function key (PF1-PF24, Enter, Clear, etc.)"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Map common keys
            key_mapping = {
                'ENTER': 'Enter',
                'CLEAR': 'Clear',
                'PF1': 'PF(1)', 'PF2': 'PF(2)', 'PF3': 'PF(3)', 'PF4': 'PF(4)',
                'PF5': 'PF(5)', 'PF6': 'PF(6)', 'PF7': 'PF(7)', 'PF8': 'PF(8)',
                'PF9': 'PF(9)', 'PF10': 'PF(10)', 'PF11': 'PF(11)', 'PF12': 'PF(12)'
            }

            s3270_key = key_mapping.get(key.upper(), key)
            self._execute_command(s3270_key)
            time.sleep(1)

            screen_content = self.get_screen_text()

            return {
                "success": True,
                "message": f"Function key {key} sent",
                "screen_content": screen_content
            }

        except Exception as e:
            return {"success": False, "message": f"Function key error: {str(e)}"}

    def send_file_to_mainframe(self, local_path: str, mainframe_dataset: str, transfer_mode: str = 'ascii') -> Dict:
        """Send file from Windows to Mainframe using IND$FILE"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Validate local file exists
            if not os.path.exists(local_path):
                return {"success": False, "message": f"Local file not found: {local_path}"}

            # Read local file content
            with open(local_path, 'rb') as f:
                file_content = f.read()

            # Determine transfer mode (ASCII or BINARY)
            mode_flag = 'ascii' if transfer_mode.lower() == 'ascii' else 'binary'

            # Use IND$FILE protocol via s3270
            # Navigate to TSO/ISPF command line (assuming already logged in)
            self._execute_command('Clear')
            time.sleep(0.5)

            # Type IND$FILE command to receive file on mainframe
            indfile_cmd = f'IND$FILE PUT {mainframe_dataset} {mode_flag}'
            self._execute_command(f'String("{indfile_cmd}")')
            time.sleep(0.5)

            # Press Enter to start transfer
            self._execute_command('Enter')
            time.sleep(1)

            # Send file data in chunks
            chunk_size = 4096
            total_bytes = len(file_content)
            bytes_sent = 0

            for i in range(0, total_bytes, chunk_size):
                chunk = file_content[i:i+chunk_size]
                # Convert binary data to string if in ASCII mode
                if transfer_mode.lower() == 'ascii':
                    try:
                        chunk_str = chunk.decode('utf-8')
                        self._execute_command(f'String("{chunk_str}")')
                    except UnicodeDecodeError:
                        return {"success": False, "message": "File contains non-ASCII characters, use binary mode"}
                else:
                    # For binary mode, send as hex string
                    hex_str = chunk.hex()
                    self._execute_command(f'String("{hex_str}")')

                bytes_sent += len(chunk)
                time.sleep(0.1)

            # Signal end of file transfer
            self._execute_command('Enter')
            time.sleep(2)

            # Get screen to check transfer result
            result_screen = self.get_screen_text()

            # Check for success indicators
            if 'TRANSFER COMPLETE' in result_screen.upper() or 'FILE TRANSFERRED' in result_screen.upper():
                return {
                    "success": True,
                    "message": f"File transferred successfully to {mainframe_dataset}",
                    "bytes_transferred": bytes_sent,
                    "screen_content": result_screen
                }
            else:
                return {
                    "success": False,
                    "message": "File transfer may have failed, check screen output",
                    "screen_content": result_screen
                }

        except Exception as e:
            return {"success": False, "message": f"File transfer error: {str(e)}"}

    def get_file_from_mainframe(self, mainframe_dataset: str, local_path: str, transfer_mode: str = 'ascii') -> Dict:
        """Get file from Mainframe to Windows using IND$FILE"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Determine transfer mode
            mode_flag = 'ascii' if transfer_mode.lower() == 'ascii' else 'binary'

            # Use IND$FILE protocol via s3270
            self._execute_command('Clear')
            time.sleep(0.5)

            # Type IND$FILE command to send file from mainframe
            indfile_cmd = f'IND$FILE GET {mainframe_dataset} {mode_flag}'
            self._execute_command(f'String("{indfile_cmd}")')
            time.sleep(0.5)

            # Press Enter to start transfer
            self._execute_command('Enter')
            time.sleep(2)

            # Receive file data
            # This is a simplified implementation - actual IND$FILE protocol is more complex
            file_data = []
            max_attempts = 100
            attempts = 0

            while attempts < max_attempts:
                screen_content = self.get_screen_text()

                # Check for transfer complete
                if 'TRANSFER COMPLETE' in screen_content.upper() or 'FILE TRANSFERRED' in screen_content.upper():
                    break

                # Extract data from screen (this is simplified)
                # In real implementation, you'd need to parse the actual data stream
                if screen_content.strip():
                    file_data.append(screen_content)

                # Send Enter to get next screen/chunk
                self._execute_command('Enter')
                time.sleep(0.5)
                attempts += 1

            # Combine received data
            received_content = '\n'.join(file_data)

            # Create local directory if it doesn't exist
            local_dir = os.path.dirname(local_path)
            if local_dir and not os.path.exists(local_dir):
                os.makedirs(local_dir)

            # Write to local file
            write_mode = 'w' if transfer_mode.lower() == 'ascii' else 'wb'
            with open(local_path, write_mode) as f:
                if transfer_mode.lower() == 'ascii':
                    f.write(received_content)
                else:
                    # For binary mode, convert from hex string
                    try:
                        binary_data = bytes.fromhex(received_content)
                        f.write(binary_data)
                    except ValueError:
                        f.write(received_content.encode('utf-8'))

            bytes_received = len(received_content)

            return {
                "success": True,
                "message": f"File retrieved successfully from {mainframe_dataset}",
                "bytes_received": bytes_received,
                "local_path": local_path
            }

        except Exception as e:
            return {"success": False, "message": f"File retrieval error: {str(e)}"}

    def disconnect(self):
        """Close the s3270 connection"""
        try:
            if self.process and self.process.poll() is None:
                # Send quit command to s3270
                self.process.stdin.write("Quit\n")
                self.process.stdin.flush()

                # Wait for graceful shutdown
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force terminate if needed
                    self.process.terminate()
                    self.process.wait(timeout=5)

            self.is_connected = False
            self.is_logged_in = False
            return True
        except Exception as e:
            return False

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Check for s3270 in different OS paths
    s3270_paths = [
        "/opt/homebrew/bin/s3270",  # macOS Homebrew
        "/usr/bin/s3270",            # Linux
        "/usr/local/bin/s3270",      # Alternative Linux/macOS
        r"C:\Program Files\wc3270\s3270.exe",  # Windows
    ]
    s3270_available = any(os.path.exists(path) for path in s3270_paths)

    return jsonify({
        "success": True,
        "status": "healthy",
        "s3270_available": s3270_available,
        "active_sessions": len(sessions)
    })

@app.route('/api/connect', methods=['POST'])
def connect_mainframe():
    """Connect to IBM Mainframe using s3270"""
    # Auto-cleanup expired sessions before creating new connection
    try:
        cleaned = cleanup_expired_sessions()
        if cleaned > 0:
            print(f"Auto-cleaned {cleaned} expired session(s) before new connection")
    except Exception as e:
        print(f"Error during auto-cleanup: {e}")

    data = request.get_json()
    if not data or 'host' not in data:
        return jsonify({"success": False, "message": "Host is required"}), 400

    host = data['host']
    port = data.get('port', 23)

    # Create new session
    session_id = str(uuid.uuid4())
    session = S3270Session(session_id)

    success, message = session.connect(host, port)
    if success:
        sessions[session_id] = {
            'session': session,
            'created_at': datetime.now(),
            'last_accessed': datetime.now()
        }

        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": message,
            "host": host,
            "port": port
        })
    else:
        return jsonify({
            "success": False,
            "message": message,
            "host": host,
            "port": port
        }), 400

@app.route('/api/login', methods=['POST'])
def login_mainframe():
    """Login to mainframe"""
    data = request.get_json()
    if not data or not all(key in data for key in ['session_id', 'username', 'password']):
        return jsonify({"success": False, "message": "session_id, username, and password are required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    session = sessions[session_id]['session']
    result = session.login(data['username'], data['password'])

    return jsonify(result)

@app.route('/api/screen', methods=['GET'])
def get_screen():
    """Get current screen content"""
    session_id = request.args.get('session_id')
    if not session_id or session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    session = sessions[session_id]['session']
    screen_content = session.get_screen_text()

    return jsonify({
        "success": True,
        "screen_content": screen_content,
        "connected": session.is_connected,
        "logged_in": session.is_logged_in
    })

@app.route('/api/command', methods=['POST'])
def send_command():
    """Send command to mainframe"""
    data = request.get_json()
    if not data or not all(key in data for key in ['session_id', 'command']):
        return jsonify({"success": False, "message": "session_id and command are required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    command = data['command']
    session = sessions[session_id]['session']

    # Check if it's a function key
    if command.upper().startswith('PF') or command.upper() in ['ENTER', 'CLEAR']:
        result = session.send_function_key(command)
    else:
        result = session.send_command(command)

    return jsonify(result)

@app.route('/api/disconnect', methods=['POST'])
def disconnect_mainframe():
    """Disconnect from mainframe"""
    data = request.get_json()
    if not data or 'session_id' not in data:
        return jsonify({"success": False, "message": "session_id is required"}), 400

    session_id = data['session_id']
    if session_id in sessions:
        session = sessions[session_id]['session']
        session.disconnect()
        del sessions[session_id]

    return jsonify({"success": True, "message": "Disconnected successfully"})

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """List active sessions"""
    session_list = []
    for session_id, session_data in sessions.items():
        session = session_data['session']
        session_list.append({
            'session_id': session_id,
            'host': session.host,
            'port': session.port,
            'connected': session.is_connected,
            'logged_in': session.is_logged_in,
            'created_at': session_data['created_at'].isoformat()
        })

    return jsonify({
        "success": True,
        "sessions": session_list
    })

@app.route('/api/sendfile', methods=['POST'])
def send_file():
    """Send file from Windows to Mainframe"""
    data = request.get_json()
    if not data or not all(key in data for key in ['session_id', 'local_path', 'mainframe_dataset']):
        return jsonify({"success": False, "message": "session_id, local_path, and mainframe_dataset are required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    local_path = data['local_path']
    mainframe_dataset = data['mainframe_dataset']
    transfer_mode = data.get('transfer_mode', 'ascii')

    session = sessions[session_id]['session']
    result = session.send_file_to_mainframe(local_path, mainframe_dataset, transfer_mode)

    return jsonify(result)

@app.route('/api/getfile', methods=['POST'])
def get_file():
    """Get file from Mainframe to Windows"""
    data = request.get_json()
    if not data or not all(key in data for key in ['session_id', 'mainframe_dataset', 'local_path']):
        return jsonify({"success": False, "message": "session_id, mainframe_dataset, and local_path are required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    mainframe_dataset = data['mainframe_dataset']
    local_path = data['local_path']
    transfer_mode = data.get('transfer_mode', 'ascii')

    session = sessions[session_id]['session']
    result = session.get_file_from_mainframe(mainframe_dataset, local_path, transfer_mode)

    return jsonify(result)

@app.route('/api/cleanup', methods=['POST'])
def cleanup_all_sessions():
    """Cleanup all sessions - useful for debugging and resetting"""
    count = 0
    session_ids = list(sessions.keys())

    for session_id in session_ids:
        try:
            session = sessions[session_id]['session']
            session.disconnect()
            del sessions[session_id]
            count += 1
        except Exception as e:
            print(f"Error cleaning up session {session_id}: {e}")

    return jsonify({
        "success": True,
        "message": f"Cleaned up {count} session(s)",
        "cleaned_count": count
    })

if __name__ == '__main__':
    print("Starting IBM Mainframe API Server with s3270...")

    # Find s3270 executable
    s3270_paths = [
        r"C:\Program Files\wc3270\s3270.exe",
        "/opt/homebrew/bin/s3270",
        "/usr/bin/s3270",
        "/usr/local/bin/s3270"
    ]
    s3270_path = next((path for path in s3270_paths if os.path.exists(path)), "s3270 (in PATH)")
    print(f"s3270 path: {s3270_path}")
    print("Session auto-cleanup: Enabled (runs on every new connection)")

    # Run Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)