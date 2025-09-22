# IBM Mainframe 连接功能完整测试 Prompt

## 测试目标
验证基于 Next.js + Flask + py3270 的 IBM Mainframe 3270 终端模拟器功能是否完全正常工作。

## 环境要求
- Node.js 和 npm (前端)
- Python 3.x 和虚拟环境 (后端)
- x3270 套件 (包含 s3270 二进制文件)
- 支持 mock 模式测试

## 测试步骤

### 1. 环境准备
```bash
# 1.1 启动虚拟环境
source /Users/handsomeboy/文档/TCS/test-workflow-nextjs/.venv/bin/activate

# 1.2 设置PATH确保包含必要工具
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# 1.3 设置测试模式 (使用mock模式)
export MAINFRAME_TEST_MODE=true
```

### 2. 后端服务启动
```bash
# 2.1 进入后端目录并启动Flask服务
cd backend
python app.py

# 预期输出:
# Starting IBM Mainframe API Server...
# py3270 available: True
# * Running on http://localhost:5001
```

### 3. 前端服务启动
```bash
# 3.1 在新终端中启动Next.js前端
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
cd /Users/handsomeboy/文档/TCS/test-workflow-nextjs
npm run dev

# 预期输出:
# ▲ Next.js 15.4.5
# - Local: http://localhost:3000
```

### 4. 后端API端点测试

#### 4.1 健康检查
```bash
curl -s http://localhost:5001/api/health | jq .
```
**预期结果:**
```json
{
  "success": true,
  "status": "healthy",
  "py3270_available": true,
  "active_sessions": 0
}
```

#### 4.2 连接测试 (Mock模式)
```bash
curl -s -X POST http://localhost:5001/api/connect \
  -H "Content-Type: application/json" \
  -d '{"host": "test.mainframe.com", "port": 23}' | jq .
```
**预期结果:**
```json
{
  "success": true,
  "session_id": "uuid-string",
  "message": "(MOCK) Connected to test.mainframe.com:23"
}
```

#### 4.3 登录测试 (使用上一步返回的session_id)
```bash
# 替换 SESSION_ID 为实际返回的session_id
curl -s -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"session_id": "SESSION_ID", "username": "test", "password": "test"}' | jq .
```
**预期结果:**
```json
{
  "success": true,
  "message": "Login successful",
  "screen_content": "MOCK MAINFRAME SYSTEM\n\nWelcome to Mock System\nUser: test\nTime: 2025-09-22 15:30:00"
}
```

#### 4.4 屏幕内容获取
```bash
curl -s "http://localhost:5001/api/screen?session_id=SESSION_ID" | jq .
```

#### 4.5 命令发送测试
```bash
curl -s -X POST http://localhost:5001/api/command \
  -H "Content-Type: application/json" \
  -d '{"session_id": "SESSION_ID", "command": "LISTCAT"}' | jq .
```

### 5. 前端UI测试

#### 5.1 访问Mainframe页面
- 打开浏览器访问: http://localhost:3000/mainframe
- 验证页面加载无错误
- 确认状态显示为 "Disconnected"

#### 5.2 连接测试
1. 在 "Mainframe Host" 字段输入: `test.mainframe.com`
2. 端口保持默认: `23`
3. 点击 "Connect to Mainframe" 按钮
4. **预期结果:** 显示成功连接消息，状态变为 "Connected"

#### 5.3 登录测试
1. 连接成功后，应出现登录表单
2. 用户名输入: `test`
3. 密码输入: `test`
4. 点击 "Login to Mainframe" 按钮
5. **预期结果:** 显示登录成功，并展示模拟的终端屏幕内容

#### 5.4 终端交互测试
1. 在命令输入框输入: `LISTCAT`
2. 点击发送或按Enter
3. **预期结果:** 显示模拟的命令执行结果

### 6. 错误处理测试

#### 6.1 无效主机连接测试 (关闭测试模式)
```bash
# 暂时关闭mock模式测试真实连接错误处理
export MAINFRAME_TEST_MODE=false
# 重启后端服务...

# 测试连接到不存在的主机
curl -s -X POST http://localhost:5001/api/connect \
  -H "Content-Type: application/json" \
  -d '{"host": "nonexistent.mainframe.com", "port": 23}' | jq .
```
**预期结果:** 返回400状态码和错误信息，而不是500

#### 6.2 前端错误显示测试
- 在前端尝试连接不存在的主机
- 验证错误消息正确显示
- 确认不会卡在"Connecting..."状态

### 7. 完整功能验证清单

#### ✅ 后端功能
- [ ] Flask服务正常启动 (端口5001)
- [ ] py3270库正确导入
- [ ] CORS配置允许localhost:3000访问
- [ ] /api/health 返回200状态
- [ ] /api/connect 在mock模式下成功连接
- [ ] /api/login 使用test/test凭证成功登录
- [ ] /api/screen 返回屏幕内容
- [ ] /api/command 执行命令并返回结果
- [ ] /api/disconnect 正确断开连接
- [ ] 错误情况返回400而不是500
- [ ] 会话管理正常工作

#### ✅ 前端功能
- [ ] Next.js服务正常启动 (端口3000)
- [ ] /mainframe 页面正常加载
- [ ] 连接表单正确显示
- [ ] 连接按钮点击后状态更新
- [ ] 登录表单在连接后显示
- [ ] 登录成功后显示终端界面
- [ ] 命令输入和发送功能正常
- [ ] 错误消息正确显示
- [ ] 状态指示器准确反映连接状态
- [ ] "Back to Workflow" 链接正常工作

#### ✅ 集成功能
- [ ] 前后端通信无CORS错误
- [ ] API调用和响应格式正确
- [ ] 会话状态在前后端同步
- [ ] 实时屏幕更新正常
- [ ] 错误处理机制完整

### 8. 性能和稳定性测试

#### 8.1 并发连接测试
```bash
# 创建多个并发连接
for i in {1..5}; do
  curl -s -X POST http://localhost:5001/api/connect \
    -H "Content-Type: application/json" \
    -d '{"host": "test'$i'.mainframe.com", "port": 23}' &
done
wait
```

#### 8.2 会话清理测试
- 验证长时间空闲会话被自动清理
- 检查内存使用情况
- 确认断开连接后资源正确释放

### 9. 真实环境准备说明

#### 9.1 生产环境配置
```bash
# 关闭测试模式，使用真实连接
export MAINFRAME_TEST_MODE=false

# 确保s3270可用
which s3270
# 应该返回: /opt/homebrew/bin/s3270
```

#### 9.2 真实大机连接要求
- 有效的IBM Mainframe主机地址
- 正确的端口号 (通常是23)
- 有效的用户凭证
- 网络连接到大机系统

### 10. 故障排除指南

#### 10.1 常见问题和解决方案
```bash
# 问题1: s3270 not found
brew install x3270

# 问题2: CORS错误
# 检查backend/app.py中的CORS配置

# 问题3: 端口占用
lsof -i :5001
lsof -i :3000

# 问题4: 虚拟环境问题
deactivate
source .venv/bin/activate
pip install -r requirements.txt
```

#### 10.2 日志查看
```bash
# 后端日志
tail -f /tmp/mainframe_api.log

# 前端浏览器控制台
# F12 -> Console 查看错误信息
```

## 测试完成标准

当以下所有条件满足时，可认为IBM Mainframe连接功能测试完成且通过：

1. ✅ 所有API端点返回正确的HTTP状态码和JSON响应
2. ✅ 前端页面无JavaScript错误，功能交互正常
3. ✅ Mock模式下完整流程 (连接→登录→终端操作) 成功
4. ✅ 错误处理机制正确工作，无500内部错误
5. ✅ 前后端集成无CORS或通信问题
6. ✅ 会话管理和状态同步正常
7. ✅ 准备就绪可接入真实IBM Mainframe环境

## 后续步骤

测试通过后，可以：
1. 配置真实的IBM Mainframe连接参数
2. 部署到生产环境
3. 添加更多3270命令支持
4. 实现更复杂的终端功能 (如文件传输)
5. 添加用户认证和授权机制

---

**注意:** 此测试prompt确保IBM Mainframe连接功能的完整性和可靠性，涵盖从基础API到前端交互的所有关键组件。