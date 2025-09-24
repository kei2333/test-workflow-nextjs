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
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]}})

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
            # Special test mode - just start s3270 in script mode without connecting
            if host.lower() == "localhost" and port == 3270:
                s3270_cmd = [
                    's3270',
                    '-model', '3279-4',  # 3270 model 4 (43x80)
                    '-script'            # Enable scripting mode without connection
                ]
            else:
                # Regular connection mode
                s3270_cmd = [
                    's3270',
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
                bufsize=0
            )

            # Wait a moment for connection to establish
            time.sleep(2)

            # Check if process is still running (successful connection)
            if self.process.poll() is None:
                self.host = host
                self.port = port
                self.is_connected = True

                # Get initial screen content
                initial_screen = self._execute_command('Ascii')

                return True, f"Successfully connected to {host}:{port} using s3270"
            else:
                stderr_output = self.process.stderr.read()
                return False, f"Connection failed: {stderr_output}"

        except Exception as e:
            return False, f"Connection error: {str(e)}"

    def _send_command(self, command: str) -> Dict[str, str]:
        """Send command to s3270 process and get response"""
        if not self.process or self.process.poll() is not None:
            return {"status": "error", "data": "Connection lost"}

        try:
            # Send command to s3270
            self.process.stdin.write(f"{command}\n")
            self.process.stdin.flush()

            # Read response lines
            response_lines = []
            status = "ok"

            while True:
                line = self.process.stdout.readline().strip()
                if not line:
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

    def _execute_command(self, command: str) -> str:
        """Execute a command and return just the data"""
        result = self._send_command(command)
        if result["status"] == "error":
            return f"Error: {result['data']}"
        return result["data"]

    def get_screen_text(self) -> str:
        """Get current screen content as text"""
        screen_content = self._execute_command('Ascii')

        # In test mode (localhost:3270), provide more meaningful content
        if self.host == "localhost" and self.port == 3270:
            if not screen_content.strip() or screen_content.count('\n') > 20:
                return f"""
***** s3270 Test Mode *****

IBM 3270 Terminal Emulator
Test Environment

Session Information:
- Host: {self.host}:{self.port}
- Model: IBM-3279-4-E
- Connected: {'Yes' if self.is_connected else 'No'}
- Logged In: {'Yes' if self.is_logged_in else 'No'}

Test commands you can try:
- Type 'HELP' for test mode help
- Type 'STATUS' for session status
- Type 'CLEAR' to clear screen
- Type 'EXIT' to disconnect

Ready for input...
"""

        return screen_content

    def login(self, username: str, password: str) -> Dict:
        """Perform login to mainframe"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Get current screen to see login prompt
            screen = self.get_screen_text()

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

            # Check for common success indicators in screen content
            success_indicators = ['READY', 'ISPF', 'MAIN MENU', 'TSO', 'LOGON']
            error_indicators = ['INVALID', 'ERROR', 'FAILED', 'INCORRECT']

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

            # In test mode, provide interactive responses
            if self.host == "localhost" and self.port == 3270:
                return self._handle_test_command(command)

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

    def _handle_test_command(self, command: str) -> Dict:
        """Handle commands in test mode with simulated responses"""
        cmd = command.strip().upper()

        if cmd == "HELP":
            response = f"""
***** s3270 Test Mode - Help *****

Available Test Commands:
- HELP     : Show this help message
- STATUS   : Display session status
- CLEAR    : Clear the screen
- EXIT     : Disconnect from session
- ISPF     : Simulate ISPF startup
- LOGOFF   : Simulate logoff
- TIME     : Show current time
- ECHO <text> : Echo back text

IBM 3270 Terminal Emulator Test Environment
Session: {self.session_id[:8]}...
Ready for next command.
"""
        elif cmd == "STATUS":
            response = f"""
***** Session Status *****

Host: {self.host}:{self.port}
Model: IBM-3279-4-E
Connected: Yes
Logged In: {'Yes' if self.is_logged_in else 'No'}
Session ID: {self.session_id[:8]}...
Last Command: {self.last_command}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Ready for next command.
"""
        elif cmd == "CLEAR":
            response = """


***** Screen Cleared *****

IBM 3270 Terminal Emulator
Test Environment

Ready for input...
"""
        elif cmd == "ISPF":
            response = """
***** ISPF Primary Option Menu *****

 0  Settings          Terminal and user parameters
 1  View              Display source data or listings
 2  Edit              Create or change source data
 3  Utilities         Perform utility functions
 4  Foreground        Interactive language processing
 5  Batch             Submit job for language processing
 6  Command           Enter TSO or Workstation commands
 10 SDSF              System Display and Search Facility
 11 Workplace         ISPF Object/Action Workplace

 Enter X to terminate using log/list defaults

Option ===> _
"""
        elif cmd == "TIME":
            response = f"""
Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Session Duration: Active
Test Mode: Enabled

Ready for next command.
"""
        elif cmd.startswith("ECHO "):
            echo_text = command[5:].strip()
            response = f"""
Echo Response: {echo_text}

Ready for next command.
"""
        elif cmd in ["EXIT", "LOGOFF"]:
            response = """
***** Disconnecting *****

Thank you for using s3270 Test Mode
Session terminated.
"""
        else:
            response = f"""
***** Command Executed *****

Command: {command}
Result: Simulated execution in test mode

Available commands: HELP, STATUS, CLEAR, ISPF, TIME, ECHO, EXIT
Type HELP for more information.

Ready for next command.
"""

        return {
            "success": True,
            "message": "Test command executed successfully",
            "command": command,
            "screen_content": response
        }

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
    return jsonify({
        "success": True,
        "status": "healthy",
        "s3270_available": os.path.exists("/opt/homebrew/bin/s3270") or os.path.exists("/usr/bin/s3270"),
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
    print(f"s3270 path: {'/opt/homebrew/bin/s3270' if os.path.exists('/opt/homebrew/bin/s3270') else '/usr/bin/s3270'}")

    app.run(host='localhost', port=5001, debug=True)