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
import sys
import re
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
        self.login_type = 'standard'  # 'standard' or 'tso'
        self.created_at = datetime.now()
        self.process = None
        self.screen_buffer = ""
        self.last_command = ""

    def connect(self, host: str, port: int = 23) -> Tuple[bool, str]:
        """Connect to mainframe using s3270"""
        try:
            # Determine s3270 executable path based on OS
            s3270_paths = [
                r"C:\Program Files\wc3270\s3270.exe",  # Windows wc3270
                r"C:\Program Files (x86)\wc3270\s3270.exe",  # Windows wc3270 x86
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
                    '-connecttimeout', '180',  # 3 minutes timeout for TK5
                    '-codepage', 'cp037', # Use EBCDIC code page
                    f'{host}:{port}'
                ]
            else:
                # Standard configuration for modern systems like pub400
                s3270_cmd = [
                    s3270_exe,
                    '-model', '3279-4',  # 3270 model 4 (43x80)
                    '-script',           # Enable scripting mode
                    '-connecttimeout', '180',  # 3 minutes timeout for slow connections
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

            # Wait for connection to establish with intelligent waiting
            connect_start = time.time()
            print(f"\n[CONNECTION] Starting connection to {host}:{port} at {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")

            # Initial short delay to let connection start
            time.sleep(1.0)

            # Check if process is still running (successful connection)
            if self.process.poll() is None:
                self.host = host
                self.port = port
                self.is_connected = True

                # Use intelligent wait for initial screen with appropriate timeout
                timeout = 60 if host == 'localhost' and port == 3270 else 30
                success, initial_screen, wait_time = self._wait_for_screen_ready(timeout=timeout, poll_interval=0.5)

                connect_elapsed = time.time() - connect_start
                print(f"[CONNECTION] Successfully connected | Screen ready: {wait_time:.2f}s | Total: {connect_elapsed:.2f}s\n")

                return True, f"Successfully connected to {host}:{port} using s3270 (took {connect_elapsed:.2f}s)"
            else:
                stderr_output = self.process.stderr.read()
                return False, f"Connection failed: {stderr_output}"

        except Exception as e:
            return False, f"Connection error: {str(e)}"

    def _send_command(self, command: str, timeout: int = 30) -> Dict[str, str]:
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

    def _execute_command(self, command: str, timeout: int = 30) -> str:
        """Execute a command and return just the data"""
        result = self._send_command(command, timeout)
        if result["status"] == "error":
            return f"Error: {result['data']}"
        return result["data"]

    def get_screen_text(self) -> str:
        """Get current screen content as text"""
        screen_content = self._execute_command('Ascii')
        return screen_content

    def _wait_for_screen_ready(self, timeout: float = 10.0, poll_interval: float = 0.5) -> Tuple[bool, str, float]:
        """
        Wait for screen content to stabilize (stop changing)
        Returns: (success, final_screen_content, elapsed_time)
        """
        start_time = time.time()
        last_screen = ""
        stable_count = 0
        required_stable_checks = 2  # Screen must be stable for 2 consecutive checks

        while time.time() - start_time < timeout:
            current_screen = self.get_screen_text()

            if current_screen == last_screen:
                stable_count += 1
                if stable_count >= required_stable_checks:
                    elapsed = time.time() - start_time
                    return True, current_screen, elapsed
            else:
                stable_count = 0
                last_screen = current_screen

            time.sleep(poll_interval)

        # Timeout reached
        elapsed = time.time() - start_time
        return False, last_screen, elapsed

    def _wait_for_screen_content(self, expected_content: str, timeout: float = 10.0, poll_interval: float = 0.5, case_sensitive: bool = False) -> Tuple[bool, str, float]:
        """
        Wait for specific content to appear on screen
        Returns: (success, screen_content, elapsed_time)
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            screen = self.get_screen_text()

            # Check if expected content is present
            if case_sensitive:
                if expected_content in screen:
                    elapsed = time.time() - start_time
                    return True, screen, elapsed
            else:
                if expected_content.upper() in screen.upper():
                    elapsed = time.time() - start_time
                    return True, screen, elapsed

            time.sleep(poll_interval)

        # Timeout reached
        elapsed = time.time() - start_time
        return False, screen, elapsed

    def ensure_ready_prompt(self, max_attempts: int = 5, wait_seconds: float = 2.0) -> Tuple[bool, str]:
        """Attempt to reach the READY prompt by issuing PF3 as needed"""
        last_screen = ""
        for _ in range(max_attempts):
            screen = self.get_screen_text()
            last_screen = screen
            if 'READY' in screen.upper():
                return True, screen
            self._execute_command('PF(3)')
            time.sleep(wait_seconds)
        return 'READY' in last_screen.upper(), last_screen

    def check_job_status(
        self,
        job_identifier: str,
        max_attempts: int = 5,
        wait_seconds: float = 5.0
    ) -> Dict:
        """Poll job status from the READY prompt until OUTPUT QUEUE or attempts exhausted"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        if not self.is_logged_in:
            return {"success": False, "message": "Not logged in to mainframe"}

        identifier = job_identifier.strip()
        if not identifier:
            return {"success": False, "message": "Job identifier is required"}

        ready, ready_screen = self.ensure_ready_prompt()
        if not ready:
            return {
                "success": False,
                "message": "Unable to reach READY prompt",
                "screen_content": ready_screen
            }

        status_history: List[Dict[str, str]] = []
        reached_output_queue = False
        job_state: Optional[str] = None

        for attempt in range(1, max_attempts + 1):
            self._execute_command('Clear')
            time.sleep(0.5)
            self._execute_command(f'String("STATUS {identifier}")')
            time.sleep(0.5)
            self._execute_command('Enter')
            time.sleep(3)

            screen_content = self.get_screen_text()
            screen_upper = screen_content.upper()
            status_history.append({
                "attempt": str(attempt),
                "screen_content": screen_content
            })

            if 'NOT FOUND' in screen_upper or 'UNKNOWN JOB' in screen_upper:
                return {
                    "success": False,
                    "message": f"Job {identifier} not found",
                    "screen_content": screen_content,
                    "attempts": attempt,
                    "history": status_history
                }

            known_states = [
                'OUTPUT QUEUE',
                'INPUT QUEUE',
                'ACTIVE',
                'PRINT QUEUE',
                'EXECUTING',
                'WAITING',
                'HELD'
            ]
            job_state = next((state for state in known_states if state in screen_upper), job_state)

            if 'OUTPUT QUEUE' in screen_upper:
                reached_output_queue = True
                job_state = 'OUTPUT QUEUE'
                return {
                    "success": True,
                    "message": f"Job {identifier} reached OUTPUT QUEUE",
                    "job_identifier": identifier,
                    "job_state": job_state,
                    "screen_content": screen_content,
                    "attempts": attempt,
                    "history": status_history,
                    "reached_output_queue": True
                }

            if attempt < max_attempts:
                time.sleep(wait_seconds)

        return {
            "success": True,
            "message": f"Status polling completed for {identifier}",
            "job_identifier": identifier,
            "job_state": job_state or "UNKNOWN",
            "attempts": max_attempts,
            "history": status_history,
            "reached_output_queue": reached_output_queue
        }

    def get_job_output(
        self,
        job_identifier: str,
        max_pages: int = 50
    ) -> Dict:
        """Retrieve job output pages and persist them to disk"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        if not self.is_logged_in:
            return {"success": False, "message": "Not logged in to mainframe"}

        identifier = job_identifier.strip()
        if not identifier:
            return {"success": False, "message": "Job identifier is required"}

        ready, ready_screen = self.ensure_ready_prompt()
        if not ready:
            return {
                "success": False,
                "message": "Unable to reach READY prompt",
                "screen_content": ready_screen
            }

        self._execute_command('Clear')
        time.sleep(0.5)
        self._execute_command(f'String("OUTPUT {identifier} KEEP")')
        time.sleep(0.5)
        self._execute_command('Enter')
        time.sleep(3)

        pages: List[str] = []
        cond_code: Optional[str] = None

        for page in range(max_pages):
            screen_content = self.get_screen_text()
            screen_upper = screen_content.upper()
            pages.append(screen_content)

            if page == 0 and ('NOT FOUND' in screen_upper or 'NO OUTPUT AVAILABLE' in screen_upper):
                return {
                    "success": False,
                    "message": f"No output available for {identifier}",
                    "screen_content": screen_content,
                    "pages": page + 1
                }

            cond_match = re.search(r'COND(?:ITION)?\s+CODE\s*[:=]\s*([A-Z0-9]+)', screen_content, re.IGNORECASE)
            if not cond_code and cond_match:
                cond_code = cond_match.group(1).strip()

            if 'READY' in screen_upper and 'OUTPUT' not in screen_upper and page > 0:
                break

            if page + 1 >= max_pages:
                break

            time.sleep(1.5)
            self._execute_command('Enter')
            time.sleep(1.5)

        output_text = "\n\n".join(pages)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(base_dir, 'downloads', 'job_outputs')
        os.makedirs(output_dir, exist_ok=True)

        sanitized_identifier = re.sub(r'[^A-Za-z0-9_.-]', '_', identifier)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{sanitized_identifier}_{timestamp}.txt"
        file_path = os.path.join(output_dir, filename)

        with open(file_path, 'w', encoding='utf-8', errors='ignore') as output_file:
            output_file.write(output_text)

        relative_path = os.path.relpath(file_path, start=base_dir)

        return {
            "success": True,
            "message": f"Job output saved to {relative_path}",
            "job_identifier": identifier,
            "cond_code": cond_code,
            "pages": len(pages),
            "output_path": relative_path,
            "screen_content": pages[-1] if pages else "",
            "output_excerpt": pages[0] if pages else ""
        }

    def login(self, username: str, password: str, login_type: str = 'standard') -> Dict:
        """Perform login to mainframe"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # Store login type for logout
            self.login_type = login_type

            # Get current screen to see login prompt
            initial_screen = self.get_screen_text()
            # Safe print with encoding handling
            try:
                print(f"DEBUG: Initial screen content:\n{initial_screen}")
            except UnicodeEncodeError:
                print("DEBUG: Initial screen content received (contains special characters)")

            # TSO-based login flow for IBM mainframes with intelligent waiting and performance logging
            if login_type == 'tso':
                login_start_time = time.time()
                print(f"\n{'='*60}")
                print(f"[TSO LOGIN PERFORMANCE] Starting TSO login at {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
                print(f"{'='*60}\n")

                # Step 1: Get initial screen (no artificial delay needed)
                step_start = time.time()
                success, screen_1, wait_time = self._wait_for_screen_ready(timeout=5.0, poll_interval=0.3)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 1] Initial screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_1[:200]}...")
                except UnicodeEncodeError:
                    print(f"[STEP 1] Initial screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")

                # Step 2: Type TSO and press Enter
                step_start = time.time()
                self._execute_command('String("TSO")')
                time.sleep(0.3)  # Small delay for command to register
                self._execute_command('Enter')

                # Wait for TSO screen (intelligent wait instead of fixed 15s)
                success, screen_2, wait_time = self._wait_for_screen_ready(timeout=20.0, poll_interval=0.5)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 2] TSO command sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_2[:200]}...")
                except UnicodeEncodeError:
                    print(f"[STEP 2] TSO command sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")

                # Step 3: Type username and press Enter
                step_start = time.time()
                self._execute_command(f'String("{username}")')
                time.sleep(0.3)
                self._execute_command('Enter')

                # Wait for username processing (intelligent wait instead of fixed 15s)
                success, screen_3, wait_time = self._wait_for_screen_ready(timeout=20.0, poll_interval=0.5)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 3] Username sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_3[:200]}...")
                except UnicodeEncodeError:
                    print(f"[STEP 3] Username sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")

                # Step 4: Type password and press Enter
                step_start = time.time()
                self._execute_command(f'String("{password}")')
                time.sleep(0.3)
                self._execute_command('Enter')

                # Wait for authentication (intelligent wait instead of fixed 20s)
                success, screen_4, wait_time = self._wait_for_screen_ready(timeout=25.0, poll_interval=0.5)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 4] Password sent, authentication complete | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_4[:200]}...")
                except UnicodeEncodeError:
                    print(f"[STEP 4] Password sent, authentication complete | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")

                # Step 5: Press Enter (for /)
                step_start = time.time()
                self._execute_command('Enter')

                # Wait for screen update (intelligent wait instead of fixed 10s)
                success, screen_5, wait_time = self._wait_for_screen_ready(timeout=15.0, poll_interval=0.5)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 5] First Enter sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_5[:200]}...")
                except UnicodeEncodeError:
                    print(f"[STEP 5] First Enter sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")

                # Step 6: Press Enter again
                step_start = time.time()
                self._execute_command('Enter')

                # Wait for screen update (intelligent wait instead of fixed 10s)
                success, screen_6, wait_time = self._wait_for_screen_ready(timeout=15.0, poll_interval=0.5)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 6] Second Enter sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_6[:200]}...")
                except UnicodeEncodeError:
                    print(f"[STEP 6] Second Enter sent, screen ready | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")

                # Step 7: Type ISPF and press Enter (final step for complete connection)
                step_start = time.time()
                self._execute_command('String("ISPF")')
                time.sleep(0.3)
                self._execute_command('Enter')

                # Wait for ISPF to load (intelligent wait instead of fixed 30s)
                success, screen_7, wait_time = self._wait_for_screen_ready(timeout=35.0, poll_interval=0.5)
                step_elapsed = time.time() - step_start
                try:
                    print(f"[STEP 7] ISPF command sent, ISPF loaded | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    print(f"Screen preview: {screen_7[:200]}...")
                    sys.stdout.flush()
                except UnicodeEncodeError:
                    print(f"[STEP 7] ISPF command sent, ISPF loaded | Wait: {wait_time:.2f}s | Total: {step_elapsed:.2f}s")
                    sys.stdout.flush()

                # Print performance summary
                total_login_time = time.time() - login_start_time
                print(f"\n{'='*60}")
                print(f"[TSO LOGIN PERFORMANCE SUMMARY]")
                print(f"Total login time: {total_login_time:.2f}s")
                print(f"Completed at: {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
                print(f"{'='*60}\n")
                sys.stdout.flush()

            # TK5 specific login handling
            elif self.host == 'localhost' and self.port == 3270:
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

    def send_file_to_mainframe(self, local_path: str, mainframe_dataset: str, transfer_mode: str = 'ascii', host_type: str = 'tso') -> Dict:
        """Send file from local to Mainframe using the s3270 Transfer action."""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        if not os.path.exists(local_path):
            return {"success": False, "message": f"Local file not found: {local_path}"}

        # Transfer command requires cursor to be in a field that accepts TSO commands
        # Need to go back to READY prompt if we're in ISPF
        print("Ensuring we're at READY prompt for Transfer command...")
        self._execute_command('PF(3)')  # Exit ISPF to READY
        time.sleep(1)
        screen = self.get_screen_text()

        # Check if we're at READY prompt
        if "READY" not in screen:
            print("Warning: Not at READY prompt, Transfer might fail")
            print(f"Current screen preview: {screen[:200]}")

        # Ensure the local path is absolute and properly formatted for the command
        abs_local_path = os.path.abspath(local_path)

        # On Windows, s3270 (from wc3270) often expects forward slashes.
        if sys.platform == "win32":
            abs_local_path = abs_local_path.replace('\\', '/')

        # Construct the Transfer command
        # Based on x3270 documentation: parameters are option=value format
        # TSO dataset names need to be wrapped in single quotes for IND$FILE
        transfer_command = (
            f"Transfer(Direction=send,LocalFile={abs_local_path},"
            f"HostFile='{mainframe_dataset}',Host={host_type.lower()},Mode={transfer_mode.lower()})"
        )

        print(f"Executing transfer command: {transfer_command}")

        # Execute the command using a longer timeout for file transfers
        result = self._send_command(transfer_command, timeout=300)  # 5-minute timeout

        if result["status"] == "ok":
            # The data part of the response often contains transfer statistics
            return {
                "success": True,
                "message": f"File transfer completed for {mainframe_dataset}.",
                "details": result.get("data", "No additional details from s3270.")
            }
        else:
            return {
                "success": False,
                "message": "File transfer failed.",
                "details": result.get("data", "Unknown error.")
            }

    def get_file_from_mainframe(self, mainframe_dataset: str, local_path: str, transfer_mode: str = 'ascii', host_type: str = 'tso') -> Dict:
        """Get file from Mainframe to local using the s3270 Transfer action."""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        # Transfer command requires cursor to be in a field that accepts TSO commands
        # Need to go back to READY prompt if we're in ISPF
        print("Ensuring we're at READY prompt for Transfer command...")
        self._execute_command('PF(3)')  # Exit ISPF to READY
        time.sleep(1)
        screen = self.get_screen_text()

        # Check if we're at READY prompt
        if "READY" not in screen:
            print("Warning: Not at READY prompt, Transfer might fail")
            print(f"Current screen preview: {screen[:200]}")

        # Create local directory if it doesn't exist
        local_dir = os.path.dirname(local_path)
        if local_dir and not os.path.exists(local_dir):
            os.makedirs(local_dir)

        abs_local_path = os.path.abspath(local_path)

        # On Windows, s3270 might need forward slashes
        if sys.platform == "win32":
            abs_local_path = abs_local_path.replace('\\', '/')

        # Construct the Transfer command
        # Based on x3270 documentation: parameters are option=value format
        # TSO dataset names need to be wrapped in single quotes for IND$FILE
        transfer_command = (
            f"Transfer(Direction=receive,HostFile='{mainframe_dataset}',"
            f"LocalFile={abs_local_path},Host={host_type.lower()},Mode={transfer_mode.lower()})"
        )

        print(f"Executing transfer command: {transfer_command}")

        # Execute the command with a longer timeout
        result = self._send_command(transfer_command, timeout=300)  # 5-minute timeout

        if result["status"] == "ok":
            return {
                "success": True,
                "message": f"File successfully retrieved from {mainframe_dataset} to {local_path}",
                "details": result.get("data", "No additional details from s3270.")
            }
        else:
            return {
                "success": False,
                "message": "File retrieval failed.",
                "details": result.get("data", "Unknown error.")
            }

    def submit_jcl(self, jcl_dataset_name: str) -> Dict:
        """
        Submit JCL job using TSO SUB command from READY prompt

        Args:
            jcl_dataset_name: JCL dataset name WITHOUT quotes (e.g., 'HERC01.TEST.JCL(MYJOB)')

        Returns:
            {"success": bool, "message": str, "job_id": str, "screen_content": str}
        """
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        if not self.is_logged_in:
            return {"success": False, "message": "Not logged in to mainframe"}

        try:
            # Get current screen to see where we are
            initial_screen = self.get_screen_text()
            try:
                print(f"DEBUG: JCL Submit Step 0 - Initial screen:\n{initial_screen}")
                sys.stdout.flush()
            except UnicodeEncodeError:
                print("DEBUG: JCL Submit Step 0 - Initial screen received")
                sys.stdout.flush()

            # Step 1: Press F3 to exit ISPF and return to TSO READY prompt
            self._execute_command('PF(3)')
            time.sleep(3)

            # Get screen after F3
            screen_1 = self.get_screen_text()
            try:
                print(f"DEBUG: JCL Submit Step 1 - After F3 screen:\n{screen_1}")
                sys.stdout.flush()
            except UnicodeEncodeError:
                print("DEBUG: JCL Submit Step 1 - After F3 screen received")
                sys.stdout.flush()

            # Check if READY prompt appears
            if 'READY' not in screen_1.upper():
                return {
                    "success": False,
                    "message": "READY prompt not found after F3. Please ensure you are in ISPF.",
                    "screen_content": screen_1
                }

            # Step 2: Type SUB command with JCL dataset name
            sub_command = f"sub '{jcl_dataset_name}'"
            self._execute_command(f'String("{sub_command}")')
            time.sleep(0.5)

            # Step 3: Press Enter to submit the JCL
            self._execute_command('Enter')
            time.sleep(3)

            # Get screen after Enter
            screen_3 = self.get_screen_text()
            try:
                print(f"DEBUG: JCL Submit Step 3 - After Enter (submission):\n{screen_3}")
                sys.stdout.flush()
            except UnicodeEncodeError:
                print("DEBUG: JCL Submit Step 3 - After Enter screen received")
                sys.stdout.flush()

            # Check for success indicators
            screen_3_upper = screen_3.upper()

            if 'SUBMITTED' in screen_3_upper and 'JOB' in screen_3_upper:
                # Extract job ID - match anything between "JOB " and " SUBMITTED"
                job_id = "Unknown"
                import re
                job_match = re.search(r'JOB\s+(.+?)\s+SUBMITTED', screen_3, re.IGNORECASE)
                if job_match:
                    job_id = job_match.group(1).strip()

                return {
                    "success": True,
                    "message": f"JCL job submitted successfully",
                    "job_id": job_id,
                    "screen_content": screen_3
                }
            elif 'ERROR' in screen_3_upper or 'INVALID' in screen_3_upper or 'FAILED' in screen_3_upper or 'NOT FOUND' in screen_3_upper:
                return {
                    "success": False,
                    "message": "JCL submission failed - check screen content for errors",
                    "screen_content": screen_3
                }
            else:
                return {
                    "success": False,
                    "message": "JCL submission result unclear - please check screen content",
                    "screen_content": screen_3
                }

        except Exception as e:
            return {"success": False, "message": f"JCL submission error: {str(e)}"}

    def logout(self) -> Dict:
        """Logout from mainframe (F3 + LOGOFF sequence for TSO login)"""
        if not self.is_connected:
            return {"success": False, "message": "Not connected to mainframe"}

        try:
            # TSO login type - use F3/LOGOFF sequence
            if self.login_type == 'tso':
                # Get screen before logout
                screen_before = self.get_screen_text()
                try:
                    print(f"DEBUG: Logout Step 0 - Before logout:\n{screen_before}")
                    sys.stdout.flush()
                except UnicodeEncodeError:
                    print("DEBUG: Logout Step 0 - Before logout screen received")
                    sys.stdout.flush()

                # Step 1: Press F3
                self._execute_command('PF(3)')
                time.sleep(3)  # Wait for screen to update

                # Get screen after F3
                screen_1 = self.get_screen_text()
                try:
                    print(f"DEBUG: Logout Step 1 - After F3 screen:\n{screen_1}")
                    sys.stdout.flush()
                except UnicodeEncodeError:
                    print("DEBUG: Logout Step 1 - After F3 screen received")
                    sys.stdout.flush()

                # Check if READY appears
                if 'READY' in screen_1.upper():
                    # Step 2: Type LOGOFF and press Enter
                    self._execute_command('String("LOGOFF")')
                    time.sleep(0.5)
                    self._execute_command('Enter')
                    time.sleep(3)  # Wait for screen to update

                    # Get final screen
                    screen_2 = self.get_screen_text()
                    try:
                        print(f"DEBUG: Logout Step 2 - After LOGOFF screen:\n{screen_2}")
                        sys.stdout.flush()
                    except UnicodeEncodeError:
                        print("DEBUG: Logout Step 2 - After LOGOFF screen received")
                        sys.stdout.flush()

                    self.is_logged_in = False
                    return {
                        "success": True,
                        "message": "Logout successful",
                        "screen_content": screen_2
                    }
                else:
                    return {
                        "success": False,
                        "message": "READY not found after F3",
                        "screen_content": screen_1
                    }
            else:
                # For other systems, just mark as logged out
                self.is_logged_in = False
                return {
                    "success": True,
                    "message": "Logout completed"
                }

        except Exception as e:
            return {"success": False, "message": f"Logout error: {str(e)}"}

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
    login_type = data.get('login_type', 'standard')
    result = session.login(data['username'], data['password'], login_type)

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

@app.route('/api/logout', methods=['POST'])
def logout_mainframe():
    """Logout from mainframe"""
    data = request.get_json()
    if not data or 'session_id' not in data:
        return jsonify({"success": False, "message": "session_id is required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    session = sessions[session_id]['session']
    result = session.logout()

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
    host_type = data.get('host_type', 'tso')

    session = sessions[session_id]['session']
    result = session.send_file_to_mainframe(local_path, mainframe_dataset, transfer_mode, host_type)

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
    host_type = data.get('host_type', 'tso')

    session = sessions[session_id]['session']
    result = session.get_file_from_mainframe(mainframe_dataset, local_path, transfer_mode, host_type)

    return jsonify(result)

@app.route('/api/submit_jcl', methods=['POST'])
def submit_jcl():
    """Submit JCL job"""
    data = request.get_json()
    if not data or not all(key in data for key in ['session_id', 'jcl_dataset_name']):
        return jsonify({"success": False, "message": "session_id and jcl_dataset_name are required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    jcl_dataset_name = data['jcl_dataset_name']
    session = sessions[session_id]['session']
    result = session.submit_jcl(jcl_dataset_name)

    if result.get('success') and result.get('job_id'):
        sessions[session_id]['last_job_identifier'] = result['job_id']

    return jsonify(result)


@app.route('/api/job_status', methods=['POST'])
def job_status():
    """Poll job status until OUTPUT QUEUE or attempts exhausted"""
    data = request.get_json()
    if not data or 'session_id' not in data:
        return jsonify({"success": False, "message": "session_id is required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    stored_identifier = sessions[session_id].get('last_job_identifier')
    job_identifier = data.get('job_identifier') or stored_identifier

    if not job_identifier:
        return jsonify({"success": False, "message": "job_identifier is required"}), 400

    try:
        max_attempts = int(data.get('max_attempts') or 5)
    except (TypeError, ValueError):
        max_attempts = 5

    try:
        wait_seconds = float(data.get('wait_seconds') or 5.0)
    except (TypeError, ValueError):
        wait_seconds = 5.0

    session = sessions[session_id]['session']
    result = session.check_job_status(job_identifier, max_attempts, wait_seconds)

    if result.get('success'):
        sessions[session_id]['last_job_identifier'] = job_identifier
        sessions[session_id]['last_job_status'] = {
            'job_identifier': job_identifier,
            'job_state': result.get('job_state'),
            'reached_output_queue': result.get('reached_output_queue')
        }

    return jsonify(result)


@app.route('/api/job_output', methods=['POST'])
def job_output():
    """Fetch job output and persist to downloads folder"""
    data = request.get_json()
    if not data or 'session_id' not in data:
        return jsonify({"success": False, "message": "session_id is required"}), 400

    session_id = data['session_id']
    if session_id not in sessions:
        return jsonify({"success": False, "message": "Invalid session"}), 404

    update_session_access(session_id)
    stored_identifier = sessions[session_id].get('last_job_identifier')
    job_identifier = data.get('job_identifier') or stored_identifier

    if not job_identifier:
        return jsonify({"success": False, "message": "job_identifier is required"}), 400

    try:
        max_pages = int(data.get('max_pages') or 50)
    except (TypeError, ValueError):
        max_pages = 50

    session = sessions[session_id]['session']
    result = session.get_job_output(job_identifier, max_pages)

    if result.get('success'):
        sessions[session_id]['last_job_identifier'] = job_identifier
        sessions[session_id]['last_job_output_path'] = result.get('output_path')
        sessions[session_id]['last_job_cond_code'] = result.get('cond_code')

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