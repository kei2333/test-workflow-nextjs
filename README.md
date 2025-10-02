# IBM Mainframe Test Workflow System / IBM大型机测试工作流系统

A modern web-based system for creating drag-and-drop test workflows and connecting to IBM mainframes via s3270 terminal emulation.

一个现代化的基于Web的系统，用于创建拖放式测试工作流并通过s3270终端仿真连接IBM大型机。

## 🎉 **Latest Release - TK5 Local Mainframe Integration**

### ✅ **What's New (Latest Update)**
- 🏠 **Local TK5 Mainframe**: Successfully integrated with TK5 MVS 3.8j system (localhost:3270)
- 📁 **CreateFile Enhancement**: Real file creation functionality with actual downloadable files
- 🔗 **Dual Mainframe Support**: Both pub400.com (remote) and TK5 (local) mainframe connections
- 💾 **File Generation**: Structured file creation with copybook layouts and multiple formats
- 🚀 **Workflow Integration**: LogonISPF + CreateFile workflows execute on real mainframe systems
- 🖥️ **Seamless Navigation**: Added "Mainframe Terminal" button in homepage header for quick access
- ⚡ **Real-time Terminal**: Full interactive s3270 terminal with live screen updates
- 📱 **Responsive Design**: Beautiful gradient UI with hover effects and animations

### 🎯 **Demo Flow**
1. Visit `http://localhost:3000` (or network IP for WiFi access) - Main workflow builder interface
2. **Local TK5**: Connect to `localhost:3270` with credentials `HERC01/CUL8TR`
3. **Remote pub400**: Connect to `pub400.com:23` with credentials `pub400/pub400`
4. **Test CreateFile**: Build LogonISPF + CreateFile workflow with real file generation
5. Experience real IBM mainframe interaction via s3270
6. **Network Access**: Available at `http://[your-ip]:3000` for other devices on same WiFi

### 💡 **Technical Achievement**
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Python Flask + s3270 native integration
- **Mainframes**: TK5 MVS 3.8j (localhost:3270) + pub400.com IBM i system
- **File Processing**: Real file generation with copybook layouts and structured content
- **UI/UX**: Glass-morphism design with smooth transitions

## 🌟 Features / 功能特性

### 🚀 **Latest Updates - Real Mainframe Connectivity**
- **🔗 Live Mainframe Connection**: Successfully connects to real IBM mainframe systems (pub400.com)
- **🖥️ Dual Interface**: Seamless navigation between workflow builder and mainframe terminal
- **⚡ Quick Access Button**: One-click navigation to mainframe terminal from homepage
- **🔄 Real-time Integration**: Workflow functions execute on actual mainframe systems
- **🔗 实时大型机连接**: 成功连接真实的IBM大型机系统 (pub400.com)
- **🖥️ 双界面系统**: 工作流构建器和大型机终端之间的无缝导航
- **⚡ 快速访问按钮**: 从主页一键导航到大型机终端
- **🔄 实时集成**: 工作流功能在真实大型机系统上执行

### Test Workflow Builder / 测试工作流构建器
- **Drag & Drop Interface**: Create test workflows by dragging functions from left panel to canvas
- **Visual Workflow Design**: Build complex test processes with an intuitive interface
- **Function Execution**: Execute workflows with real-time progress tracking
- **Real Mainframe Execution**: Workflows execute on actual IBM systems via s3270
- **拖放界面**: 从左侧面板拖拽功能到画布创建测试工作流
- **可视化工作流设计**: 用直观的界面构建复杂的测试流程
- **功能执行**: 实时进度跟踪执行工作流
- **真实大型机执行**: 工作流在真实IBM系统上通过s3270执行

### IBM Mainframe Integration / IBM大型机集成
- **s3270 Terminal Emulation**: Native IBM 3270 terminal emulator integration
- **Real Mainframe Connection**: Connect to actual IBM mainframe systems (pub400.com)
- **Interactive Terminal**: Full-screen terminal interface with real-time updates
- **Authentication Support**: Secure login with username/password validation
- **Session Management**: Multiple concurrent mainframe sessions
- **Command Execution**: Send commands and receive real mainframe responses
- **s3270终端仿真**: 原生IBM 3270终端仿真器集成
- **真实大型机连接**: 连接到实际的IBM大型机系统 (pub400.com)
- **交互式终端**: 带实时更新的全屏终端界面
- **身份验证支持**: 用户名/密码验证的安全登录
- **会话管理**: 多个并发大型机会话
- **命令执行**: 发送命令并接收真实大型机响应

## 🏗️ Architecture / 系统架构

```
Frontend (Next.js + React + TypeScript)
    ↓ HTTP API
Backend (Python Flask + s3270)
    ↓ 3270 Protocol
IBM Mainframe Systems
```

## 🚀 How to Run This Website / 网站运行教程

### 📋 Required Software List / 所需软件列表

Before you start, here's what you'll need to install (we'll check each one first):
开始之前，这里列出了需要安装的软件（我们会先检查每个软件是否已安装）：

#### 🪟 For Windows / Windows系统:
- ✅ **Node.js** (v18 or higher) - JavaScript runtime for the website
- ✅ **Git** - Version control to download the project
- ✅ **Python** (v3.8 or higher) - Backend server language
- ✅ **s3270** (wc3270) - IBM mainframe terminal emulator
- 🔄 **TK5** (Optional) - Local IBM mainframe environment (~1GB download)
- ✅ **Node.js** (v18及以上) - 网站的JavaScript运行环境
- ✅ **Git** - 版本控制工具，用于下载项目
- ✅ **Python** (v3.8及以上) - 后端服务器语言
- ✅ **s3270** (wc3270) - IBM大型机终端仿真器
- 🔄 **TK5** (可选) - 本地IBM大型机环境 (~1GB下载)

#### 🍎 For Mac / Mac系统:
- ✅ **Homebrew** - Package manager for Mac
- ✅ **Node.js** (v18 or higher) - JavaScript runtime for the website
- ✅ **Git** - Version control to download the project
- ✅ **Python** (v3.8 or higher) - Backend server language
- ✅ **s3270** - IBM mainframe terminal emulator
- 🔄 **Hercules** (Optional) - Mainframe emulator for TK5
- 🔄 **TK5** (Optional) - Local IBM mainframe environment (~1GB download)
- ✅ **Homebrew** - Mac的包管理器
- ✅ **Node.js** (v18及以上) - 网站的JavaScript运行环境
- ✅ **Git** - 版本控制工具，用于下载项目
- ✅ **Python** (v3.8及以上) - 后端服务器语言
- ✅ **s3270** - IBM大型机终端仿真器
- 🔄 **Hercules** (可选) - TK5的大型机仿真器
- 🔄 **TK5** (可选) - 本地IBM大型机环境 (~1GB下载)

#### 📦 Python Packages (Automatically Installed) / Python包（自动安装）:
- `flask` - Web framework for backend API
- `flask-cors` - Cross-origin resource sharing
- `py3270` - Python interface for s3270 mainframe connections
- `python-dotenv` - Environment variable management

#### 📊 Estimated Installation Time / 预计安装时间:
- **New installation (without TK5)**: 15-30 minutes / **全新安装(不含TK5)**: 15-30分钟
- **New installation (with TK5)**: 30-60 minutes / **全新安装(含TK5)**: 30-60分钟
- **If software already installed**: 5-10 minutes / **如果软件已安装**: 5-10分钟
- **TK5 download alone**: 10-30 minutes depending on internet speed / **仅TK5下载**: 根据网速需10-30分钟

#### 🔍 Quick Check Commands / 快速检查命令:
Before following the detailed guide, you can quickly check what's already installed:
在按照详细教程操作之前，您可以快速检查已安装的软件：

**Windows (Command Prompt):**
```cmd
node --version
git --version
python --version
s3270 --version
netstat -an | findstr :3270
```

**Mac (Terminal):**
```bash
brew --version
node --version
git --version
python3 --version
s3270 --version
netstat -an | grep 3270
```

**Command Results Explanation / 命令结果说明:**
- **Version numbers** = Software is installed / **显示版本号** = 软件已安装
- **"command not found"** = Software needs installation / **"command not found"** = 需要安装软件
- **TK5 check (last command)**: If shows "LISTENING", TK5 is running / **TK5检查(最后命令)**: 显示"LISTENING"表示TK5正在运行

If you see version numbers for the first 4 commands, you can skip to downloading the project!
如果前4个命令都显示版本号，您可以直接跳到下载项目部分！

---

### 🪟 For Windows Users (Windows用户教程)

This is a detailed guide for running the Test Workflow website on your Windows computer. No previous programming experience required!

这是一个在Windows电脑上运行测试工作流网站的详细教程。无需编程经验！

#### Step 1: Check and Install Node.js (检查并安装Node.js)
1. **First, Check if Node.js is Already Installed**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - In the black window, type: `node --version`
   - If you see a version number like `v18.x.x` or `v20.x.x`, **Node.js is already installed - skip to Step 2!**
   - If you see "command not found" or an error, continue with installation below

2. **Download Node.js** (only if not installed):
   - Go to: https://nodejs.org/
   - You will see two big green buttons - click the **"LTS"** button (Recommended for most users)
   - This will download a file like `node-v20.x.x-x64.msi`

3. **Install Node.js** (only if not installed):
   - Double-click the downloaded `.msi` file
   - Click "Next" through all the installation steps
   - Accept the license agreement
   - Keep all default settings - just keep clicking "Next"
   - Click "Install" and wait for it to finish
   - **Important**: Restart your computer after installation

4. **Verify Installation**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - In the black window, type: `node --version`
   - You should see something like `v20.x.x` - this means Node.js is installed correctly

#### Step 2: Check and Install Git (检查并安装Git)
1. **First, Check if Git is Already Installed**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - In the black window, type: `git --version`
   - If you see a version number like `git version 2.x.x`, **Git is already installed - skip to Step 3!**
   - Also check: Right-click on your Desktop - if you see "Git Bash Here", Git is installed
   - If you see "command not found" or no "Git Bash Here" option, continue with installation below

2. **Download Git** (only if not installed):
   - Go to: https://git-scm.com/download/win
   - Click "Download for Windows" - this will download `Git-x.x.x-64-bit.exe`

3. **Install Git** (only if not installed):
   - Double-click the downloaded `.exe` file
   - **Important**: Keep ALL default settings - just click "Next" through everything
   - The installation will ask many questions - just keep clicking "Next"
   - Click "Install" and wait for completion

4. **Verify Git is Working**:
   - On your Desktop, right-click on empty space
   - You should now see "Git Bash Here" in the menu - this means Git is installed correctly

#### Step 3: Download the Website Files (下载网站文件)
1. **Open Git Bash**:
   - On your Desktop, right-click on empty space
   - Click "Git Bash Here"
   - A black window will open

2. **Download the Project**:
   - In the black window, type this command and press Enter:
   ```bash
   git clone https://github.com/kei2333/test-workflow-nextjs.git
   ```
   - Wait for the download to complete (you'll see progress messages)

3. **Enter the Project Folder**:
   ```bash
   cd test-workflow-nextjs
   ```

4. **Get Latest Updates** (if you already have the project):
   ```bash
   git pull origin master
   ```

#### Step 4: Install Required Packages (安装必需包)
1. **Install Website Dependencies**:
   - In the same Git Bash window, type:
   ```bash
   npm install
   ```
   - This will take 2-5 minutes - you'll see lots of text scrolling
   - Wait until you see the cursor blinking again (meaning it's done)

#### Step 5: Check and Install Python (检查并安装Python)
1. **First, Check if Python is Already Installed**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - In the black window, type: `python --version`
   - If you see a version number like `Python 3.8.x` or higher, **Python is already installed - skip to Step 6!**
   - If you see "command not found" or an error, continue with installation below

2. **Download Python** (only if not installed):
   - Go to: https://www.python.org/downloads/
   - Click the big yellow "Download Python 3.x.x" button
   - This downloads a file like `python-3.x.x-amd64.exe`

3. **Install Python** (only if not installed):
   - Double-click the downloaded `.exe` file
   - **VERY IMPORTANT**: Check the box "Add Python to PATH" at the bottom
   - Click "Install Now"
   - Wait for installation to complete

4. **Verify Python**:
   - In Git Bash, type: `python --version`
   - You should see `Python 3.x.x`

#### Step 6: Check and Install s3270 (检查并安装s3270 - 大型机必需)
1. **First, Check if s3270 is Already Installed**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - In the black window, type: `s3270 --version`
   - If you see version information, **s3270 is already installed - skip to Step 7!**
   - Also check if this file exists: `C:\Program Files\wc3270\s3270.exe`
   - If you see "command not found" or the file doesn't exist, continue with installation below

2. **Download s3270 for Windows** (only if not installed):
   - Go to: http://x3270.bgp.nu/download.html
   - Download "wc3270" (Windows version)
   - This includes s3270.exe which is needed for mainframe connections

3. **Install s3270** (only if not installed):
   - Run the downloaded installer
   - Install to default location: `C:\Program Files\wc3270\`
   - The application will automatically find s3270.exe there

#### Step 7: Install TK5 Local Mainframe (Optional) (安装TK5本地大型机 - 可选)
TK5 provides a local IBM mainframe environment for testing without internet connection.
TK5提供本地IBM大型机环境，无需网络连接即可测试。

1. **Check if TK5 is Already Running**:
   - Press `Windows Key + R`, type `cmd` and press Enter
   - Type: `netstat -an | findstr :3270`
   - If you see `TCP 0.0.0.0:3270 ... LISTENING`, **TK5 is already running - skip to Step 8!**
   - If nothing appears, continue with installation below

2. **Download TK5** (only if not running):
   - Go to: https://www.prince-webdesign.nl/tk5
   - Download the complete TK5 system package
   - This is a large file (~1GB) - be patient!

3. **Install TK5**:
   - Extract the ZIP file to any location (e.g., `C:\tk5` or `Y:\mvs-tk5`)
   - TK5 includes Hercules emulator - no separate installation needed!

4. **Start TK5**:
   - Open the extracted folder
   - Double-click `mvs.bat`
   - A black window will open - wait for it to finish loading (2-3 minutes)
   - When you see messages about "listening on port 3270", TK5 is ready
   - **Keep this window open** - closing it will stop TK5

5. **Verify TK5 is Running**:
   - In Command Prompt, type: `netstat -an | findstr :3270`
   - You should see: `TCP 0.0.0.0:3270 ... LISTENING`
   - **Default TK5 Credentials**: Username: `HERC01`, Password: `CUL8TR`

#### Step 8: Setup Python Backend (设置Python后端)
**Important**: Make sure you're in the project directory (test-workflow-nextjs folder in Git Bash).
**重要**: 确保您在项目目录中（Git Bash中的test-workflow-nextjs文件夹）。

1. **Create Python Virtual Environment**:
   ```bash
   python -m venv .venv
   ```
   - This creates a new Python virtual environment for the project

2. **Activate Python Environment**:
   ```bash
   .venv/Scripts/activate
   ```
   - Your prompt will change to show `(.venv)` at the beginning

3. **Install Python Packages**:
   ```bash
   cd backend
   pip install flask flask-cors py3270 python-dotenv
   ```
   - This installs all required packages for the mainframe backend

4. **Create Environment Configuration File**:
   ```bash
   # Go back to project root
   cd ..

   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
   echo "NODE_ENV=development" >> .env.local
   ```
   - This creates the configuration file needed for the frontend to connect to backend

#### Step 9: Start the Website (启动网站)
1. **Start Backend Server** (in Git Bash):
   ```bash
   python app.py
   ```
   - Keep this window open - you should see "Running on http://127.0.0.1:5001"

2. **Open a NEW Git Bash Window**:
   - Right-click on Desktop again → "Git Bash Here"
   - Navigate back to the project:
   ```bash
   cd test-workflow-nextjs
   ```

3. **Start Frontend Server**:
   ```bash
   npm run dev
   ```
   - You should see "Local: http://localhost:3000"
   - You'll also see "Network: http://[your-ip]:3000" - this allows other devices on your WiFi to access the website

#### Step 10: Open the Website (打开网站)
1. **Open Your Web Browser** (Chrome, Edge, Firefox):
   - Type in the address bar: `http://localhost:3000`
   - Press Enter
   - **You should now see the Test Workflow website! 🎉**

#### 🔧 Troubleshooting (故障排除)
- **If Node.js doesn't work**: Make sure you restarted your computer after installation
- **If Git Bash doesn't appear**: Restart your computer and try again
- **If you get permission errors**: Right-click Git Bash and select "Run as administrator"
- **If the website doesn't load**: Make sure both backend and frontend are running in separate windows

---

### 🍎 For Mac Users (Mac用户教程)

This is a detailed guide for running the Test Workflow website on your Mac. No previous programming experience required!

这是一个在Mac电脑上运行测试工作流网站的详细教程。无需编程经验！

#### Step 1: Check and Install Homebrew (检查并安装Homebrew包管理器)
Homebrew makes it easy to install software on Mac.

1. **Open Terminal**:
   - Press `Command + Space` to open Spotlight
   - Type "Terminal" and press Enter
   - A black/white window will open

2. **First, Check if Homebrew is Already Installed**:
   ```bash
   brew --version
   ```
   - If you see version information like `Homebrew 4.x.x`, **Homebrew is already installed - skip to Step 2!**
   - If you see "command not found", continue with installation below

3. **Install Homebrew** (only if not installed):
   - Copy and paste this command into Terminal:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   - Press Enter and wait for installation (this takes 5-10 minutes)
   - You may be asked to enter your Mac password

4. **Verify Homebrew**:
   ```bash
   brew --version
   ```
   - You should see version information

#### Step 2: Check and Install Node.js (检查并安装Node.js)
1. **First, Check if Node.js is Already Installed**:
   ```bash
   node --version
   npm --version
   ```
   - If you see version numbers like `v18.x.x` or `v20.x.x`, **Node.js is already installed - skip to Step 3!**
   - If you see "command not found", continue with installation below

2. **Install Node.js with Homebrew** (only if not installed):
   ```bash
   brew install node
   ```
   - This will take a few minutes

3. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```
   - Both commands should show version numbers

#### Step 3: Check and Install Git (检查并安装Git)
1. **First, Check if Git is Already Installed**:
   ```bash
   git --version
   ```
   - If you see a version number like `git version 2.x.x`, **Git is already installed - skip to Step 4!**
   - If you see "command not found", continue with installation below

2. **Install Git** (only if not installed):
   ```bash
   brew install git
   ```

3. **Verify Git**:
   ```bash
   git --version
   ```

#### Step 4: Download the Website Files (下载网站文件)
1. **Navigate to Desktop**:
   ```bash
   cd ~/Desktop
   ```

2. **Download the Project**:
   ```bash
   git clone https://github.com/kei2333/test-workflow-nextjs.git
   ```

3. **Enter Project Folder**:
   ```bash
   cd test-workflow-nextjs
   ```

4. **Get Latest Updates** (if you already have the project):
   ```bash
   git pull origin master
   ```

#### Step 5: Install Project Dependencies (安装项目依赖)
1. **Install Website Packages**:
   ```bash
   npm install
   ```
   - Wait 2-5 minutes for completion

#### Step 6: Check and Install Python (检查并安装Python)
1. **First, Check if Python is Already Installed**:
   ```bash
   python3 --version
   ```
   - If you see a version number like `Python 3.8.x` or higher, **Python is already installed - skip to Step 7!**
   - If you see "command not found", continue with installation below

2. **Install Python with Homebrew** (only if not installed):
   ```bash
   brew install python
   ```

3. **Verify Python**:
   ```bash
   python3 --version
   ```

#### Step 7: Check and Install s3270 (检查并安装s3270 - 大型机必需)
1. **First, Check if s3270 is Already Installed**:
   ```bash
   s3270 --version
   ```
   - If you see version information, **s3270 is already installed - skip to Step 8!**
   - If you see "command not found", continue with installation below

2. **Install s3270 with Homebrew** (only if not installed):
   ```bash
   brew install s3270
   ```
   - This installs the s3270 terminal emulator needed for mainframe connections

3. **Verify s3270 Installation**:
   ```bash
   s3270 --version
   ```
   - You should see version information

#### Step 8: Install TK5 Local Mainframe (Optional) (安装TK5本地大型机 - 可选)
TK5 provides a local IBM mainframe environment for testing without internet connection.
TK5提供本地IBM大型机环境，无需网络连接即可测试。

1. **Check if TK5 is Already Running**:
   ```bash
   netstat -an | grep 3270
   ```
   - If you see `tcp4  0  0  *.3270  *.*  LISTEN`, **TK5 is already running - skip to Step 9!**
   - If nothing appears, continue with installation below

2. **Install Hercules Emulator** (required for TK5):
   ```bash
   brew install hercules
   ```

3. **Download TK5** (only if not running):
   - Go to: https://www.prince-webdesign.nl/tk5
   - Download the complete TK5 system package to ~/Desktop
   - Extract the downloaded file
   ```bash
   cd ~/Desktop
   # Extract the downloaded TK5 package (filename may vary)
   unzip TK5*.zip
   cd TK5*
   ```
   - This is a large file (~1GB) - be patient!

4. **Start TK5**:
   ```bash
   ./mvs
   ```
   - Wait for it to finish loading (2-3 minutes)
   - When you see messages about "listening on port 3270", TK5 is ready
   - **Keep this Terminal window open** - TK5 is running
   - **Important**: You'll need to open a NEW Terminal window for the next steps

5. **Verify TK5 is Running** (in a new Terminal window):
   ```bash
   netstat -an | grep 3270
   ```
   - You should see: `tcp4  0  0  *.3270  *.*  LISTEN`
   - **Default TK5 Credentials**: Username: `HERC01`, Password: `CUL8TR`

#### Step 9: Setup Python Backend (设置Python后端)
**Important**: Make sure you're in the project directory. If you just installed TK5, you need to navigate back:
**重要**: 确保您在项目目录中。如果刚安装了TK5，需要切换回来：

```bash
cd ~/Desktop/test-workflow-nextjs
```

1. **Create Python Virtual Environment**:
   ```bash
   python3 -m venv .venv
   ```
   - This creates a new Python virtual environment for the project

2. **Activate Python Environment**:
   ```bash
   source .venv/bin/activate
   ```
   - Your prompt will show `(.venv)` at the beginning

3. **Install Python Packages**:
   ```bash
   cd backend
   pip install flask flask-cors py3270 python-dotenv
   ```
   - This installs all required packages for the mainframe backend

4. **Create Environment Configuration File**:
   ```bash
   # Go back to project root
   cd ..

   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
   echo "NODE_ENV=development" >> .env.local
   ```
   - This creates the configuration file needed for the frontend to connect to backend

#### Step 10: Start the Website (启动网站)
1. **Start Backend Server** (in current Terminal):
   ```bash
   python3 app.py
   ```
   - You should see "Running on http://127.0.0.1:5001"
   - Keep this Terminal window open

2. **Open New Terminal Window**:
   - Press `Command + T` to open new tab
   - Or open a completely new Terminal window

3. **Navigate to Project**:
   ```bash
   cd ~/Desktop/test-workflow-nextjs
   ```

4. **Start Frontend Server**:
   ```bash
   npm run dev
   ```
   - You should see "Local: http://localhost:3000"
   - You'll also see "Network: http://[your-ip]:3000" - this allows other devices on your WiFi to access the website

#### Step 11: Open the Website (打开网站)
1. **Open Your Web Browser** (Safari, Chrome, Firefox):
   - Type in the address bar: `http://localhost:3000`
   - Press Enter
   - **You should now see the Test Workflow website! 🎉**

#### 🔧 Troubleshooting (故障排除)
- **If Homebrew installation fails**: Make sure you have internet connection and try again
- **If commands are not found**: Close and reopen Terminal, then try again
- **If Python commands don't work**: Use `python3` instead of `python`
- **If the website doesn't load**: Make sure both backend and frontend are running in separate Terminal windows

---

### 🌐 Using the Website (使用网站)

Once the website is running, you can:
网站运行后，您可以：

1. **Access the Website**:
   - **Local**: `http://localhost:3000` (only on your computer)
   - **Network**: `http://[your-ip]:3000` (from other devices on same WiFi)
   - **本地访问**: `http://localhost:3000` (仅限本机)
   - **网络访问**: `http://[你的IP]:3000` (同一WiFi下的其他设备)

2. **Drag and Drop Functions**:
   - Drag functions from the left panel to the right canvas
   - 从左侧面板拖拽功能到右侧画布

3. **Build Workflows**:
   - Arrange functions in the order you want them to execute
   - 按照您希望执行的顺序排列功能

4. **Run Workflows**:
   - Click the "Run Workflow" button to execute your test sequence
   - 点击"Run Workflow"按钮执行您的测试序列

5. **Access Mainframe Terminal**:
   - Click "Mainframe Terminal" button for advanced features
   - 点击"Mainframe Terminal"按钮使用高级功能

### 🆘 Getting Help (获取帮助)

If you encounter any issues:
如果遇到任何问题：

- **Check that both servers are running**: You should have two terminal/command windows open
- **Restart everything**: Close all windows and start from Step 7/8 again
- **Check the address**: Make sure you're going to `http://localhost:3000`
- **Try a different browser**: Sometimes different browsers work better

## 🔧 How s3270 Mainframe Connection Works / s3270大型机连接原理

### Real Mainframe Connection / 真实大型机连接

The system uses `s3270` (IBM 3270 terminal emulator) to establish authentic connections to IBM mainframe systems:

系统使用 `s3270`（IBM 3270终端仿真器）与IBM大型机系统建立真实连接：

#### 1. Connection Process / 连接过程
```python
# backend/app.py - S3270Session.connect()
s3270_cmd = [
    's3270',
    '-model', '3279-4',    # 3270 model 4 (43x80 screen)
    '-script',             # Enable scripting mode
    f'{host}:{port}'       # Connect to mainframe host:port
]

process = subprocess.Popen(
    s3270_cmd,
    stdin=subprocess.PIPE,   # Send commands
    stdout=subprocess.PIPE,  # Receive responses
    stderr=subprocess.PIPE,  # Error handling
    text=True
)
```

#### 2. Authentication / 身份验证
```python
# Send login credentials to mainframe
self._execute_command('Clear')              # Clear screen
self._execute_command(f'String("{username}")') # Type username
self._execute_command('Tab')                # Move to password field
self._execute_command(f'String("{password}")') # Type password
self._execute_command('Enter')              # Submit login
```

#### 3. Command Execution / 命令执行
```python
def _send_command(self, command: str):
    # Send command to s3270 process
    self.process.stdin.write(f"{command}\n")
    self.process.stdin.flush()

    # Read response from mainframe
    while True:
        line = self.process.stdout.readline().strip()
        if line.startswith("ok"):
            break
        elif line.startswith("error"):
            # Handle error
            break
```

#### 4. Screen Content Retrieval / 屏幕内容获取
```python
def get_screen_text(self):
    # Get current screen content from mainframe
    screen_content = self._execute_command('Ascii')
    return screen_content
```

### Real Mainframe Connection / 真实大型机连接

The system connects directly to real IBM mainframe systems:
系统直接连接到真实的IBM大型机系统：

- **Default Host**: `pub400.com:23` (IBM i AS/400 system)
- **Credentials**: `pub400/pub400` (public access)
- **Protocol**: TN3270 via s3270 terminal emulator
- **Live Connection**: Real-time interaction with actual mainframe
- **默认主机**: `pub400.com:23` (IBM i AS/400 系统)
- **凭据**: `pub400/pub400` (公共访问)
- **协议**: 通过s3270终端模拟器的TN3270
- **实时连接**: 与真实大型机的实时交互

## 📁 Project Structure / 项目结构

```
test-workflow-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main workflow builder / 主工作流构建器
│   │   └── mainframe/
│   │       └── page.tsx          # Mainframe terminal page / 大型机终端页面
│   ├── components/
│   │   ├── WorkflowBuilder.tsx   # Drag-and-drop workflow interface
│   │   ├── MainframeLogin.tsx    # Mainframe connection component
│   │   └── ...
│   ├── services/
│   │   ├── functionExecutor.ts   # Workflow execution logic
│   │   └── mainframeApi.ts       # Mainframe API client
│   ├── hooks/
│   │   └── useMainframe.ts       # Mainframe connection hook
│   └── types/
│       ├── workflow.ts           # Workflow type definitions
│       └── mainframe.ts          # Mainframe type definitions
├── backend/
│   └── app.py                    # Python Flask API server
└── README.md                     # This file / 本文件
```

## 🔌 API Endpoints / API端点

### Backend API / 后端API
- `GET /api/health` - Health check / 健康检查
- `POST /api/connect` - Connect to mainframe / 连接大型机
- `POST /api/login` - Login to mainframe / 登录大型机
- `GET /api/screen?session_id=<id>` - Get screen content / 获取屏幕内容
- `POST /api/command` - Send command / 发送命令
- `POST /api/disconnect` - Disconnect / 断开连接
- `GET /api/sessions` - List active sessions / 列出活动会话

## 🎯 Available Workflow Functions / 可用工作流功能

1. **logonispf** - Login to ISPF / 登录ISPF
2. **editjcl** - Edit JCL files / 编辑JCL文件
3. **execjcl** - Execute JCL jobs / 执行JCL作业
4. **executioncheck** - Check job execution / 检查作业执行
5. **getjoblog** - Retrieve job logs / 获取作业日志
6. **filecomp1** - File comparison / 文件比较
7. **filecomp2** - Conditional file comparison / 条件文件比较
8. **createfile** - Create files / 创建文件
9. **sendfile** - Send files to mainframe / 发送文件到大型机
10. **getfile** - Get files from mainframe / 从大型机获取文件
11. **fileconv** - File format conversion / 文件格式转换
12. **gotoispfmainscreen** - Return to ISPF main / 返回ISPF主屏幕
13. **filereccount** - Get file record count / 获取文件记录数

## 🔧 Configuration / 配置

### Environment Variables / 环境变量
```bash
# Backend configuration / 后端配置
FLASK_PORT=5001
FLASK_DEBUG=True

# Frontend configuration / 前端配置
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Mainframe Connection Settings / 大型机连接设置
- **Default Host**: `pub400.com` (IBM i AS/400 system)
- **Default Port**: 23 (Telnet)
- **Default Credentials**: `pub400/pub400`
- **Models Supported**: IBM-3279-4-E (43x80 display)
- **Protocols**: TN3270, TN3270E
- **Terminal Type**: 5250 (AS/400) via s3270 emulation
- **默认主机**: `pub400.com` (IBM i AS/400系统)
- **默认端口**: 23 (Telnet)
- **默认凭据**: `pub400/pub400`
- **支持型号**: IBM-3279-4-E (43x80显示)
- **协议**: TN3270, TN3270E
- **终端类型**: 通过s3270仿真的5250 (AS/400)

## 🛠️ Development / 开发

### Adding New Workflow Functions / 添加新的工作流功能
1. Define function in `src/data/functions.ts`
2. Implement logic in `src/services/functionExecutor.ts`
3. Update type definitions in `src/types/workflow.ts`

### Extending Mainframe Integration / 扩展大型机集成
1. Add new commands in `backend/app.py`
2. Update API client in `src/services/mainframeApi.ts`
3. Enhance UI components in `src/components/MainframeLogin.tsx`

## 📝 Testing / 测试

### Real Mainframe Usage / 真实大型机使用
1. Start the application / 启动应用
2. Navigate to mainframe page / 导航到大型机页面
3. Use `pub400.com` as host and `23` as port (pre-configured)
4. Login with `pub400/pub400` credentials (pre-filled)
5. Experience real IBM mainframe commands and screens
6. All workflow functions execute on the actual mainframe system

## 🤝 Contributing / 贡献

1. Fork the repository / 分叉仓库
2. Create feature branch / 创建功能分支
3. Make changes / 进行更改
4. Test thoroughly / 彻底测试
5. Submit pull request / 提交拉取请求

## 📄 License / 许可证

This project is for educational and testing purposes.
本项目用于教育和测试目的。

## 🆘 Support / 支持

For issues and questions:
如有问题和疑问：
- Check the console logs / 检查控制台日志
- Verify s3270 installation / 验证s3270安装
- Ensure both services are running / 确保两个服务都在运行
- Test with localhost:3270 first / 首先用localhost:3270测试

---

**💡 This project demonstrates modern IBM mainframe integration with real-time web interfaces.**
