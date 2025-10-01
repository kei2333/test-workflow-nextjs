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
import signal
from datetime import datetime
from typing import Dict, Optional, List, Tuple
import threading
import queue

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://192.168.2.109:3000"]}})

# Global sessions storage
sessions = {}

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
            'created_at': datetime.now()
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

    session = sessions[session_id]['session']
    result = session.login(data['username'], data['password'])

    return jsonify(result)

@app.route('/api/screen', methods=['GET'])
def get_screen():
    """Get current screen content"""
    session_id = request.args.get('session_id')
    if not session_id or session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

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

    app.run(host='0.0.0.0', port=5001, debug=True)