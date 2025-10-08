# 大型机自动化测试指南

## 📋 测试内容

这个自动化测试脚本会测试以下功能：

1. **后端健康检查** - 验证 Python Flask 后端和 s3270 是否正常运行
2. **大型机连接** - 测试连接到真实的大型机
3. **大型机登录** - 测试使用 Standard 或 TSO 登录流程进行身份验证
4. **屏幕内容获取** - 验证能否获取大型机屏幕内容
5. **优雅断开** - 测试 logout + disconnect 流程（TSO 会先 logout）
6. **前端界面** - 检查主页和 Mainframe 页面是否可访问

## 🚀 运行测试

### 前提条件

1. **真实大型机必须可访问**
2. **前端服务器必须启动** (端口 3000)
3. **后端服务器必须启动** (端口 5001)
4. **设置大型机连接环境变量**

### 启动步骤

#### 1. 设置大型机连接信息

**方法 1 - 使用配置文件（推荐）:**

```bash
# 复制示例配置文件
copy test-config.example.json test-config.json

# 编辑 test-config.json，填入真实连接信息
```

`test-config.json` 内容示例：
```json
{
  "mainframe": {
    "host": "192.168.1.100",
    "port": 23,
    "username": "myuser",
    "password": "mypass",
    "loginType": "tso"
  }
}
```

> **安全提示**: `test-config.json` 已加入 `.gitignore`，不会被提交到 Git

**方法 2 - 使用环境变量:**

**Windows (CMD):**
```cmd
set MF_HOST=你的大型机地址
set MF_PORT=23
set MF_USER=你的用户名
set MF_PASS=你的密码
set MF_LOGIN_TYPE=tso
```

**Windows (PowerShell):**
```powershell
$env:MF_HOST="你的大型机地址"
$env:MF_PORT="23"
$env:MF_USER="你的用户名"
$env:MF_PASS="你的密码"
$env:MF_LOGIN_TYPE="tso"
```

> **注意**: `loginType` 可以是 `standard` 或 `tso`

#### 2. 启动前后端（如果还没启动）

```bash
# 启动前端 (新终端窗口 1)
npm run dev

# 启动后端 (新终端窗口 2)
cd backend
python app.py
```

#### 3. 运行自动化测试

```bash
# 在项目根目录运行
npm run test:mainframe
```

或者直接运行：

```bash
node test-mainframe.js
```

> **提示**: 优先使用配置文件，测试脚本会自动检测并使用 `test-config.json`

## 📊 测试输出

### 控制台输出

测试会在控制台显示彩色输出：
- 🔵 **INFO** (蓝色) - 测试步骤信息
- 🟢 **SUCCESS** (绿色) - 测试通过
- 🔴 **ERROR** (红色) - 测试失败
- 🟡 **WARN** (黄色) - 警告信息

### 日志文件

测试完成后，详细的 JSON 日志会保存到：
```
test-logs/mainframe-test-[timestamp].json
```

日志文件包含：
- 测试开始和结束时间
- 使用的配置信息
- 每个测试步骤的详细结果
- API 响应数据

## 🔧 配置说明

测试脚本从环境变量读取配置，不包含任何硬编码的凭据：

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `MF_HOST` | 大型机主机地址 | **必填** |
| `MF_PORT` | 大型机端口 | 23 |
| `MF_USER` | 用户名 | **必填** |
| `MF_PASS` | 密码 | **必填** |
| `MF_LOGIN_TYPE` | 登录类型 (standard/tso) | standard |

**安全提示**:
- 不要在代码中硬编码凭据
- 不要提交包含凭据的环境变量文件
- 使用完测试后清除环境变量

## 📈 测试结果示例

```
========================================
  测试总结
========================================

✓ 通过 - backendHealth
✓ 通过 - connection
✓ 通过 - login
✓ 通过 - screen
✓ 通过 - disconnect
✓ 通过 - frontend

总计: 6/6 测试通过

🎉 所有测试通过！

测试日志已保存到: test-logs/mainframe-test-2025-10-08T05-20-30.json
```

## 🐛 常见问题

### 1. 测试失败：无法连接到后端
- 确保后端服务器正在运行 (python app.py)
- 检查端口 5001 是否被占用

### 2. 错误：缺少大型机连接配置
- 确保已设置所有必需的环境变量 (MF_HOST, MF_USER, MF_PASS)
- 检查环境变量是否在运行测试的终端中生效

### 3. 测试失败：大型机连接失败
- 确保大型机可访问（网络连通性）
- 检查主机地址和端口是否正确
- 验证 s3270 是否正确安装

### 4. 测试失败：大型机登录失败
- 检查用户名和密码是否正确
- 确认登录类型 (standard/tso) 与大型机配置匹配
- 查看后端日志了解详细错误信息

### 5. 前端界面检查失败
- 确保前端服务器正在运行 (npm run dev)
- 检查端口 3000 是否可访问

## 📝 手动测试步骤

如果想手动验证功能：

1. **打开浏览器访问**: http://localhost:3000
2. **点击** "Mainframe Terminal" 按钮
3. **选择** "Custom Mainframe" 系统类型
4. **输入** 你的大型机连接信息（主机、端口）
5. **点击** "Connect to Mainframe"
6. **选择** 登录类型 (Standard 或 TSO)
7. **输入** 用户名和密码
8. **点击** "Login to Mainframe"
9. **查看** 屏幕内容是否显示
10. **点击** "Disconnect" 按钮（或使用主页的断开按钮）

## 🔍 查看后端日志

后端日志会显示在运行 `python app.py` 的终端中，包括：
- 连接请求
- 登录尝试
- s3270 命令执行
- 错误信息

## ⚙️ 调试提示

如果测试失败，可以：

1. **查看详细日志**：打开 `test-logs/` 目录中的 JSON 文件
2. **手动测试 API**：使用 curl 或 Postman 测试单个端点
3. **检查 s3270**：确保 s3270 在命令行中可用
4. **验证 TK5**：使用 3270 客户端手动连接验证

## 🎯 下一步

- 添加更多测试场景（发送命令、文件传输等）
- 集成 CI/CD 自动化测试
- 添加性能测试和压力测试
- 创建测试报告生成器
