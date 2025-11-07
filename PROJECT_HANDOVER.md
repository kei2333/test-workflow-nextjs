# Project Handover Document
# IBM Mainframe Test Workflow System

**Handover Date:** November 7, 2025  
**Estimated Reading Time:** 10 minutes  
**Project Repository:** https://github.com/kei2333/test-workflow-nextjs

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Quick Start Guide](#quick-start-guide)
4. [Key Features & Workflows](#key-features--workflows)
5. [Project Structure](#project-structure)
6. [Development Workflow](#development-workflow)
7. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
8. [Next Steps & Future Enhancements](#next-steps--future-enhancements)

---

## 📖 Project Overview

### What is this project?
This is a **modern web-based workflow builder** that enables users to create drag-and-drop test workflows that execute on **real IBM mainframes**. Think of it as a visual programming interface for mainframe automation.

### What problem does it solve?
- **Automated Testing**: Eliminates manual mainframe testing procedures
- **Visual Workflow Design**: Non-programmers can create complex test sequences through drag-and-drop
- **Real Mainframe Integration**: Connects to actual IBM systems (TK5 local or pub400.com remote) using s3270 automation
- **File Operations**: Automates file creation, transfer, and JCL job submission

### Who uses it?
- Mainframe testers who need to automate repetitive test sequences
- Developers testing mainframe applications
- Anyone needing to interact with IBM mainframes without manual 3270 terminal work

---

## 🏗️ Architecture & Tech Stack

### High-Level Architecture
```
┌─────────────────────────────────────────┐
│  Frontend (Next.js 15 + React 19)      │
│  - Drag & Drop Workflow Builder        │
│  - Real-time Execution Monitoring      │
│  - TypeScript for Type Safety          │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────────┐
│  Backend (Python Flask)                 │
│  - s3270 Terminal Automation            │
│  - Session Management                   │
│  - Mainframe API Abstraction            │
└──────────────┬──────────────────────────┘
               │ TN3270 Protocol
               ▼
┌─────────────────────────────────────────┐
│  IBM Mainframe Systems                  │
│  - TK5 MVS 3.8j (localhost:3270)       │
│  - pub400.com (remote AS/400)          │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- **Next.js 15.4.5** - React framework with server-side rendering
- **React 19.1.0** - UI component library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **xlsx** - Excel file processing

**Backend:**
- **Python 3.8+** - Backend language
- **Flask** - Web framework
- **s3270** - IBM 3270 terminal emulator
- **py3270** - Python wrapper for s3270
- **Flask-CORS** - Cross-origin resource sharing

**Infrastructure:**
- **TK5 MVS 3.8j** - Local IBM mainframe emulator (optional)
- **Hercules** - Mainframe emulation engine
- **wc3270** - Windows 3270 terminal emulator

---

## 🚀 Quick Start Guide

### Prerequisites
**Required Software:**
- Node.js v18 or higher
- Python 3.8 or higher
- s3270 terminal emulator
- Git

**Optional:**
- TK5 MVS 3.8j for local mainframe testing

### Installation Steps (5-10 minutes)

1. **Clone the Repository**
```bash
git clone https://github.com/kei2333/test-workflow-nextjs.git
cd test-workflow-nextjs
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
pip install flask flask-cors py3270 python-dotenv
```

4. **Configure Environment Variables**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
echo "NODE_ENV=development" >> .env.local
```

5. **Start the Backend Server** (Terminal 1)
```bash
python backend/app.py
# Server runs on http://127.0.0.1:5001
```

6. **Start the Frontend Server** (Terminal 2)
```bash
npm run dev
# Server runs on http://localhost:3000
```

7. **Access the Application**
- Open browser: `http://localhost:3000`
- Network access: `http://[your-ip]:3000` (for other devices on same WiFi)

### Optional: TK5 Setup
If you want a local mainframe environment:
```bash
# Download TK5 from https://www.prince-webdesign.nl/tk5
# Extract to desired location
# On Windows: Double-click mvs.bat
# On Mac/Linux: ./mvs
# Wait 2-3 minutes for TK5 to start on port 3270
# Default credentials: HERC01/CUL8TR
```

---

## ⚙️ Key Features & Workflows

### 1. Visual Workflow Builder
**How it works:**
- Drag functions from the left panel to the canvas
- Configure each function's parameters (host, credentials, file names, etc.)
- Functions execute sequentially when you click "Run Workflow"

**Available Functions:**
- **LogonISPF** - Connect and login to mainframe
- **SubmitJCL** - Submit JCL jobs from ISPF
- **EditJCL** - Edit JCL files
- **ExecutionCheck** - Check job execution status
- **GetJobLog** - Retrieve job logs
- **CreateFile** - Create files with copybook layouts
- **SendFile** - Transfer files to mainframe
- **GetFile** - Download files from mainframe
- **FileComp1/FileComp2** - File comparison functions
- **GoToISPFMainScreen** - Return to ISPF main menu
- **FileRecCount** - Get file record counts

### 2. Real Mainframe Connection
**Connection Process:**
1. Drag "LogonISPF" to canvas
2. Configure connection:
   - **TK5 Local**: Host: `localhost`, Port: `3270`, User: `HERC01`, Pass: `CUL8TR`
   - **pub400 Remote**: Host: `pub400.com`, Port: `23`, User: `pub400`, Pass: `pub400`
3. Select login type: `standard` or `tso`
4. Run workflow - the system establishes a real s3270 session

**Session Management:**
- Sessions persist across workflows (30-minute timeout)
- Click "Disconnect" button to manually close mainframe connection
- Session ID stored in localStorage

### 3. JCL Automation
**Typical JCL Workflow:**
```
LogonISPF → SubmitJCL → ExecutionCheck → GetJobLog
```
This automates the entire process of submitting a JCL job and retrieving results.

### 4. File Operations
**File Transfer Workflow:**
```
LogonISPF → CreateFile → SendFile → GetFile
```
Automates creating structured files, uploading to mainframe, and downloading results.

---

## 📁 Project Structure

```
test-workflow-nextjs/
│
├── src/                          # Frontend source code
│   ├── app/                      # Next.js app directory
│   │   ├── page.tsx             # Main workflow builder page
│   │   ├── layout.tsx           # Root layout component
│   │   └── api/                 # API route handlers (if any)
│   │
│   ├── components/              # React components
│   │   ├── EnhancedFunctionList.tsx     # Left panel (function list)
│   │   ├── EnhancedWorkflowCanvas.tsx   # Center canvas (workflow area)
│   │   ├── ExecutionLogPanel.tsx        # Right panel (execution logs)
│   │   ├── InputConfigModal.tsx         # Function parameter modal
│   │   └── FunctionManagementModal.tsx  # Add/edit functions
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useFunctions.ts      # Function CRUD operations
│   │   ├── useWorkflow.ts       # Workflow state management
│   │   ├── useExecutionLog.ts   # Log management
│   │   └── useNotification.ts   # Notification system
│   │
│   ├── services/                # Business logic layer
│   │   ├── functionExecutor.ts  # Workflow execution engine
│   │   └── mainframeApi.ts      # Backend API client
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── workflow.ts          # Workflow types
│   │
│   └── utils/                   # Utility functions
│       ├── excelParser.ts       # Excel file parsing
│       ├── excelGenerator.ts    # Excel file generation
│       ├── copybookParser.ts    # Copybook layout parsing
│       ├── textParser.ts        # Text file parsing
│       ├── textGenerator.ts     # Text file generation
│       └── validation.ts        # Input validation
│
├── backend/                     # Python Flask backend
│   └── app.py                   # Main Flask server with s3270 integration
│
├── data/                        # Static data
│   └── functions.json           # Function definitions
│
├── public/                      # Static assets
│
├── scripts/                     # Utility scripts
│
├── uploads/                     # Uploaded files (gitignored)
│
├── package.json                 # NPM dependencies
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── .env.local                  # Environment variables (create this)
└── README.md                   # Original documentation
```

### Key Files to Understand

**Frontend:**
1. **`src/app/page.tsx`** (795 lines)
   - Main application entry point
   - Manages all state (functions, workflow, execution)
   - Handles drag-and-drop logic
   - Coordinates between all components

2. **`src/services/functionExecutor.ts`**
   - Core workflow execution engine
   - Calls backend API for each function
   - Manages execution progress and error handling

3. **`src/services/mainframeApi.ts`**
   - Frontend client for backend API
   - All mainframe operations (connect, login, submit JCL, etc.)

**Backend:**
4. **`backend/app.py`** (main file)
   - Flask server with REST API endpoints
   - `S3270Session` class - manages s3270 terminal sessions
   - API routes for all mainframe operations

**Configuration:**
5. **`data/functions.json`**
   - Defines all available workflow functions
   - Input parameters and metadata for each function

---

## 💻 Development Workflow

### Adding a New Function

**Step 1: Define in `data/functions.json`**
```json
{
  "id": "myfunction",
  "name": "MyFunction",
  "description": "Does something cool",
  "inputs": [
    {
      "name": "Parameter1",
      "placeholder": "value1"
    }
  ]
}
```

**Step 2: Implement Backend Logic in `backend/app.py`**
```python
@app.route('/api/myfunction', methods=['POST'])
def myfunction():
    data = request.json
    session_id = data.get('sessionId')
    param1 = data.get('parameter1')
    
    # Implement your logic here
    # Use s3270 session to interact with mainframe
    
    return jsonify({
        'success': True,
        'message': 'Function executed'
    })
```

**Step 3: Add Frontend Integration in `src/services/mainframeApi.ts`**
```typescript
myFunction: async (sessionId: string, param1: string) => {
  const response = await fetch(`${API_URL}/api/myfunction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, parameter1: param1 })
  });
  return response.json();
}
```

**Step 4: Add Execution Logic in `src/services/functionExecutor.ts`**
```typescript
case 'myfunction':
  result = await mainframeApi.myFunction(
    sessionId,
    item.inputs['Parameter1']
  );
  break;
```

### Running Tests
```bash
# Currently no automated tests - manual testing required
# Future: Add Jest for frontend, pytest for backend
```

### Building for Production
```bash
# Build frontend
npm run build

# Start production server
npm start

# Backend runs same in production
python backend/app.py
```

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Dependencies Not Installed
**Symptom:** npm shows "UNMET DEPENDENCY" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: s3270 Not Found
**Symptom:** Backend fails with "s3270 not found"
**Solution:**
- **Windows:** Install wc3270 from http://x3270.bgp.nu/download.html
- **Mac:** `brew install s3270`
- **Linux:** `apt-get install s3270` or `yum install s3270`

### Issue 3: TK5 Won't Start
**Symptom:** Port 3270 not listening
**Solution:**
1. Ensure Hercules is installed (Mac: `brew install hercules`)
2. Check for port conflicts: `netstat -an | grep 3270`
3. Wait full 2-3 minutes for TK5 initialization
4. Check TK5 console for error messages

### Issue 4: Frontend Can't Connect to Backend
**Symptom:** API calls fail, CORS errors
**Solution:**
1. Verify backend is running on port 5001
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Ensure CORS is enabled in `backend/app.py`
4. Restart both servers

### Issue 5: Workflow Execution Fails
**Symptom:** Steps fail with timeout or error
**Solution:**
1. Check mainframe connection is still active (Disconnect/Reconnect)
2. Verify credentials are correct for your mainframe
3. Check execution logs for specific error messages
4. For TK5: Ensure TK5 is running and responsive
5. For pub400: Check internet connection

### Issue 6: Session Timeout
**Symptom:** "No active session" errors
**Solution:**
- Sessions expire after 30 minutes of inactivity
- Click "Disconnect" and reconnect to create a new session
- Session ID is stored in browser localStorage

---

## 🚀 Next Steps & Future Enhancements

### Immediate Priorities
1. **Add Unit Tests**
   - Frontend: Jest + React Testing Library
   - Backend: pytest
   - Target: 70%+ code coverage

2. **Error Handling Improvements**
   - Better error messages for users
   - Retry logic for transient failures
   - Session recovery mechanisms

3. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Code comments for complex logic
   - Video tutorials for end users

### Potential Features
1. **Workflow Templates**
   - Save common workflows for reuse
   - Import/export workflows as JSON
   - Share workflows between users

2. **Parallel Execution**
   - Run multiple independent functions concurrently
   - Dependency graph visualization

3. **Enhanced Monitoring**
   - Real-time mainframe screen preview
   - Detailed performance metrics
   - Execution history and replay

4. **Multi-User Support**
   - User authentication
   - Role-based access control
   - Workflow sharing and collaboration

5. **Advanced File Operations**
   - Visual copybook editor
   - File diff viewer
   - Automated file validation

### Known Limitations
- No automated testing infrastructure
- Single-user system (no authentication)
- Limited error recovery
- No workflow versioning
- Session management is basic

---

## 📞 Support & Resources

### Key Documentation
- **Project README**: `/README.md` - Comprehensive setup guide
- **Original Repo**: https://github.com/kei2333/test-workflow-nextjs
- **s3270 Manual**: http://x3270.bgp.nu/Unix/s3270-man.html
- **TK5 Documentation**: https://www.prince-webdesign.nl/tk5

### Development Resources
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Flask Docs**: https://flask.palletsprojects.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

### Getting Help
1. Check existing GitHub issues
2. Review execution logs for error details
3. Test with simple workflow first (just LogonISPF)
4. Verify all dependencies are installed
5. Check both frontend and backend console logs

---

## 🎯 Summary for Quick Reference

**What it does:** Visual workflow builder for IBM mainframe automation

**How to start:**
```bash
# Terminal 1
python backend/app.py

# Terminal 2  
npm run dev

# Browser
http://localhost:3000
```

**Main components:**
- Frontend: Next.js + React drag-and-drop interface
- Backend: Flask + s3270 mainframe automation
- Data: functions.json defines available operations

**Common tasks:**
- Add function: Edit `functions.json` → `backend/app.py` → `mainframeApi.ts` → `functionExecutor.ts`
- Debug: Check execution logs panel → backend console → s3270 screen output
- Reset: Click "Disconnect" button → Clear browser localStorage → Restart servers

---

**Good luck with the project! Feel free to reach out if you have questions as you continue development.**

**Note:** For any questions or clarifications about this handover, please refer to the project repository issues or the original developer.
