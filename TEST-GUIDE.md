# 🧪 自动化测试完整指南

## 📋 测试概览

本项目包含三类自动化测试，全面覆盖大型机连接功能：

### 1. **API 测试** (`test-mainframe.js`)
- 测试后端 API 端点
- 验证大型机连接、登录、断开
- 不使用浏览器，直接调用 API
- **运行时间**: ~1 分钟

### 2. **Mainframe Terminal UI 测试** (`test-mainframe-ui.spec.js`)
- 测试 `/mainframe` 页面的完整交互流程
- 使用 Playwright 进行浏览器自动化
- 验证连接表单、登录流程、屏幕显示
- **运行时间**: ~2 分钟

### 3. **Workflow UI 测试** (`test-workflow-ui.spec.js`)
- 测试主页的 LogonISPF 拖拽功能
- 验证 workflow 执行和断开连接按钮
- **运行时间**: ~2.5 分钟

### 4. **完整测试套件** (`test-all.spec.js`)
- 依次运行上述所有测试
- **总运行时间**: ~5-6 分钟

---

## 🚀 快速开始

### 前提条件

1. ✅ 前端服务器运行中 (http://localhost:3000)
2. ✅ 后端服务器运行中 (http://localhost:5001)
3. ✅ 已创建 `test-config.json` 配置文件
4. ✅ 大型机可访问

### 安装 Playwright

```bash
# 安装 Playwright
npm install -D @playwright/test

# 安装浏览器驱动
npx playwright install chromium
```

---

## 📝 测试命令

| 命令 | 说明 | 运行时间 |
|------|------|---------|
| `npm run test:api` | API 测试（后端） | ~1 分钟 |
| `npm run test:mainframe-ui` | Mainframe 页面 UI 测试 | ~2 分钟 |
| `npm run test:workflow-ui` | Workflow 拖拽测试 | ~2.5 分钟 |
| `npm run test:all` | 完整测试套件（有头模式） | ~5-6 分钟 |
| `npm run test:all:headless` | 完整测试套件（无头模式） | ~5-6 分钟 |
| `npm run test:ui` | 运行所有 UI 测试 | ~4.5 分钟 |
| `npm run test:ui:headed` | UI 测试（显示浏览器） | ~4.5 分钟 |
| `npm run test:ui:debug` | UI 测试（调试模式） | 手动控制 |

---

## 🔧 配置文件

### `test-config.json`

```json
{
  "mainframe": {
    "host": "172.16.111.205",
    "port": 4002,
    "username": "TRA026",
    "password": "TCS123",
    "loginType": "tso"
  }
}
```

> ⚠️ **安全提示**: 此文件已加入 `.gitignore`，不会被提交到 Git

---

## 🎯 测试详情

### 1. API 测试 (`test:api`)

**测试内容：**
1. ✅ 后端健康检查
2. ✅ 大型机连接
3. ✅ TSO/Standard 登录
4. ✅ 获取屏幕内容
5. ✅ 优雅断开（TSO logout + disconnect）
6. ✅ 前端页面可访问性

**运行：**
```bash
npm run test:api
```

**日志保存：**
- `test-logs/mainframe-test-[时间戳].json`

---

### 2. Mainframe Terminal UI 测试 (`test:mainframe-ui`)

**测试步骤：**
1. 打开 /mainframe 页面
2. 选择 Custom Mainframe
3. 输入主机和端口
4. 点击 Connect
5. 选择登录类型（TSO/Standard）
6. 输入用户名和密码
7. 点击 Login
8. 验证终端屏幕显示
9. 点击 Disconnect
10. 验证断开成功

**运行：**
```bash
npm run test:mainframe-ui
```

**截图保存：**
- `test-logs/screenshots/01-page-loaded.png`
- `test-logs/screenshots/02-custom-selected.png`
- ...（共 9 张截图）

---

### 3. Workflow UI 测试 (`test:workflow-ui`)

**测试步骤：**
1. 打开主页
2. 拖拽 LogonISPF 到 workflow
3. 在模态框中填写连接信息
4. 点击 Add Function
5. 点击 Run Workflow
6. 验证执行日志
7. 检查 session_id 存储
8. 点击主页的 Disconnect 按钮
9. 验证 session_id 已清除

**运行：**
```bash
npm run test:workflow-ui
```

**截图保存：**
- `test-logs/screenshots/workflow-01-homepage.png`
- `test-logs/screenshots/workflow-02-logonispf-found.png`
- ...（共 9 张截图）

---

### 4. 完整测试套件 (`test:all`)

**运行所有测试：**
```bash
npm run test:all
```

这将依次执行：
1. API 测试
2. Mainframe Terminal UI 测试
3. Workflow UI 测试

---

## 📊 测试报告

### Playwright HTML 报告

运行 UI 测试后，查看详细报告：

```bash
npx playwright show-report test-logs/playwright-report
```

### JSON 结果

所有测试结果保存在：
- `test-logs/mainframe-test-*.json` - API 测试日志
- `test-logs/playwright-results.json` - UI 测试结果
- `test-logs/screenshots/` - 测试截图
- `test-logs/playwright-artifacts/` - 视频和追踪

---

## 🐛 调试技巧

### 1. 调试 UI 测试

```bash
# 启动调试模式（逐步执行）
npm run test:ui:debug
```

### 2. 查看浏览器操作

```bash
# 显示浏览器窗口
npm run test:ui:headed
```

### 3. 慢速执行

在 `playwright.config.js` 中取消注释：
```javascript
launchOptions: {
  slowMo: 500  // 每步延迟 500ms
}
```

### 4. 暂停测试

在测试代码中添加：
```javascript
await page.pause();
```

### 5. 查看测试追踪

```bash
npx playwright show-trace test-logs/playwright-artifacts/trace.zip
```

---

## ❌ 常见问题

### 1. 测试失败：连接超时

**原因**：大型机不可访问或响应慢

**解决**：
- 检查大型机地址和端口
- 增加超时时间（在测试文件中修改 `timeout`）
- 检查网络连接

### 2. 测试失败：元素找不到

**原因**：页面加载慢或元素选择器变化

**解决**：
- 增加 `waitForSelector` 超时
- 使用更稳定的选择器
- 添加 `waitForLoadState('networkidle')`

### 3. TSO 登录超时

**原因**：TSO 登录需要 30-40 秒

**解决**：
- 已设置 45 秒超时
- 如仍超时，检查大型机状态
- 查看后端日志了解详情

### 4. session_id 未清除

**原因**：断开连接未完成

**解决**：
- 增加断开后的等待时间
- 手动清除：`localStorage.removeItem('mainframe-session-id')`
- 检查后端日志

### 5. Playwright 未安装

**错误**：`Cannot find module '@playwright/test'`

**解决**：
```bash
npm install -D @playwright/test
npx playwright install
```

---

## 📈 性能基准

基于测试日志的典型执行时间：

| 操作 | 平均时间 |
|------|---------|
| 连接大型机 | 2-3 秒 |
| TSO 登录 | 30-35 秒 |
| Standard 登录 | 5-10 秒 |
| 获取屏幕 | 1-2 秒 |
| TSO Logout | 10-12 秒 |
| Disconnect | 1-2 秒 |

---

## 🔍 测试覆盖

### 功能覆盖

- ✅ 大型机连接（自定义/TK5/pub400）
- ✅ TSO 登录流程
- ✅ Standard 登录流程
- ✅ 屏幕内容显示
- ✅ 命令发送和接收
- ✅ 优雅断开连接
- ✅ Session 管理
- ✅ 错误处理
- ✅ Workflow 拖拽
- ✅ 前后端集成

### 浏览器覆盖

- ✅ Chrome/Chromium
- ⏳ Firefox（可选配置）
- ⏳ Safari（可选配置）

---

## 🎓 最佳实践

### 1. 测试前准备

```bash
# 启动服务器
npm run dev          # 终端 1
cd backend && python app.py  # 终端 2

# 等待服务器就绪
# 检查 http://localhost:3000
# 检查 http://localhost:5001/api/health
```

### 2. 按需运行测试

```bash
# 快速验证：只运行 API 测试
npm run test:api

# UI 开发：只测试特定页面
npm run test:mainframe-ui

# 完整回归：运行所有测试
npm run test:all
```

### 3. CI/CD 集成

```bash
# 无头模式运行（适合 CI）
npm run test:all:headless
```

### 4. 定期清理

```bash
# 清理旧的测试日志（手动）
rm -rf test-logs/screenshots/*
rm test-logs/*.json
```

---

## 📚 扩展阅读

- [Playwright 官方文档](https://playwright.dev/)
- [TEST-README.md](./TEST-README.md) - API 测试详情
- [backend/README.md](./backend/README.md) - 后端 API 文档

---

## ✅ 测试检查清单

在提交代码前，确保：

- [ ] 所有测试通过（`npm run test:all`）
- [ ] 没有硬编码的凭据
- [ ] `test-config.json` 已加入 `.gitignore`
- [ ] 测试日志已审查
- [ ] 截图已查看（验证 UI 正常）
- [ ] 性能在可接受范围内
- [ ] 错误处理测试通过

---

## 🆘 获取帮助

如果遇到问题：

1. 查看测试日志：`test-logs/*.json`
2. 查看截图：`test-logs/screenshots/`
3. 查看后端日志（运行 `python app.py` 的终端）
4. 启用调试模式：`npm run test:ui:debug`
5. 查看追踪：`npx playwright show-trace [trace-file]`

---

**最后更新**: 2025-10-08
**版本**: 1.0.0
