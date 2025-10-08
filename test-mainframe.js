/**
 * 自动化测试脚本 - 大型机连接测试
 * 测试 LogonISPF 功能和大型机连接界面
 */

const fs = require('fs');
const path = require('path');

// 从配置文件加载测试配置
let MAINFRAME_CONFIG;

const configPath = path.join(__dirname, 'test-config.json');

if (fs.existsSync(configPath)) {
  // 从配置文件读取
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configFile);
  MAINFRAME_CONFIG = config.mainframe;
  console.log('\x1b[36m✓ 从 test-config.json 加载配置\x1b[0m\n');
} else {
  // 从环境变量读取（备选方案）
  MAINFRAME_CONFIG = {
    host: process.env.MF_HOST || '',
    port: parseInt(process.env.MF_PORT) || 23,
    username: process.env.MF_USER || '',
    password: process.env.MF_PASS || '',
    loginType: process.env.MF_LOGIN_TYPE || 'standard'
  };
}

// 验证配置
if (!MAINFRAME_CONFIG.host || !MAINFRAME_CONFIG.username || !MAINFRAME_CONFIG.password) {
  console.error('\x1b[31m错误: 缺少大型机连接配置！\x1b[0m\n');
  console.log('请使用以下任一方式配置：\n');

  console.log('方法 1 - 使用配置文件（推荐）:');
  console.log('  1. 复制 test-config.example.json 为 test-config.json');
  console.log('  2. 在 test-config.json 中填入真实连接信息');
  console.log('  3. 运行测试: npm run test:mainframe\n');

  console.log('方法 2 - 使用环境变量:');
  console.log('  set MF_HOST=你的大型机地址');
  console.log('  set MF_PORT=23');
  console.log('  set MF_USER=用户名');
  console.log('  set MF_PASS=密码');
  console.log('  set MF_LOGIN_TYPE=tso');
  console.log('  npm run test:mainframe\n');

  process.exit(1);
}

const API_BASE_URL = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:3000';

// 日志收集器
class LogCollector {
  constructor() {
    this.logs = [];
    this.startTime = new Date().toISOString();
  }

  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    this.logs.push(logEntry);

    const color = {
      'INFO': '\x1b[36m',    // Cyan
      'SUCCESS': '\x1b[32m', // Green
      'ERROR': '\x1b[31m',   // Red
      'WARN': '\x1b[33m'     // Yellow
    }[level] || '\x1b[0m';

    console.log(`${color}[${level}] ${message}\x1b[0m`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async saveLogs() {
    const logsDir = path.join(__dirname, 'test-logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    const filename = `mainframe-test-${this.startTime.replace(/:/g, '-').split('.')[0]}.json`;
    const filepath = path.join(logsDir, filename);

    const report = {
      testStartTime: this.startTime,
      testEndTime: new Date().toISOString(),
      config: MAINFRAME_CONFIG,
      logs: this.logs
    };

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    this.log('INFO', `测试日志已保存到: ${filepath}`);
    return filepath;
  }
}

// 主测试类
class MainframeTest {
  constructor() {
    this.logger = new LogCollector();
    this.sessionId = null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 测试后端健康检查
  async testBackendHealth() {
    this.logger.log('INFO', '=== 测试 1: 后端健康检查 ===');
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();

      if (data.success && data.s3270_available) {
        this.logger.log('SUCCESS', '后端健康检查通过', data);
        return true;
      } else {
        this.logger.log('ERROR', '后端健康检查失败', data);
        return false;
      }
    } catch (error) {
      this.logger.log('ERROR', '无法连接到后端服务器', { error: error.message });
      return false;
    }
  }

  // 测试大型机连接
  async testMainframeConnection() {
    this.logger.log('INFO', '=== 测试 2: 大型机连接 ===');
    try {
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: MAINFRAME_CONFIG.host,
          port: MAINFRAME_CONFIG.port
        })
      });

      const data = await response.json();

      if (data.success && data.session_id) {
        this.sessionId = data.session_id;
        this.logger.log('SUCCESS', '大型机连接成功', {
          session_id: data.session_id,
          host: data.host,
          port: data.port
        });
        return true;
      } else {
        this.logger.log('ERROR', '大型机连接失败', data);
        return false;
      }
    } catch (error) {
      this.logger.log('ERROR', '连接请求失败', { error: error.message });
      return false;
    }
  }

  // 测试大型机登录（TSO）
  async testMainframeLogin() {
    this.logger.log('INFO', '=== 测试 3: 大型机登录 (TSO) ===');
    if (!this.sessionId) {
      this.logger.log('ERROR', '没有有效的会话ID，跳过登录测试');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          username: MAINFRAME_CONFIG.username,
          password: MAINFRAME_CONFIG.password,
          login_type: MAINFRAME_CONFIG.loginType
        })
      });

      const data = await response.json();

      if (data.success) {
        this.logger.log('SUCCESS', 'TSO 登录成功', {
          message: data.message,
          screen_preview: data.screen_content?.substring(0, 200) + '...'
        });
        return true;
      } else {
        this.logger.log('ERROR', 'TSO 登录失败', data);
        return false;
      }
    } catch (error) {
      this.logger.log('ERROR', '登录请求失败', { error: error.message });
      return false;
    }
  }

  // 测试获取屏幕内容
  async testGetScreen() {
    this.logger.log('INFO', '=== 测试 4: 获取屏幕内容 ===');
    if (!this.sessionId) {
      this.logger.log('ERROR', '没有有效的会话ID，跳过屏幕测试');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/screen?session_id=${this.sessionId}`);
      const data = await response.json();

      if (data.success) {
        this.logger.log('SUCCESS', '获取屏幕内容成功', {
          connected: data.connected,
          logged_in: data.logged_in,
          screen_length: data.screen_content?.length || 0
        });
        return true;
      } else {
        this.logger.log('ERROR', '获取屏幕内容失败', data);
        return false;
      }
    } catch (error) {
      this.logger.log('ERROR', '屏幕请求失败', { error: error.message });
      return false;
    }
  }

  // 测试断开连接
  async testDisconnect() {
    this.logger.log('INFO', '=== 测试 5: 断开连接 (带 TSO Logout) ===');
    if (!this.sessionId) {
      this.logger.log('WARN', '没有有效的会话ID，跳过断开测试');
      return false;
    }

    try {
      // 先执行 logout（TSO 登录需要）
      this.logger.log('INFO', '执行 TSO Logout...');
      const logoutResponse = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: this.sessionId })
      });
      const logoutData = await logoutResponse.json();
      this.logger.log('INFO', 'Logout 响应', logoutData);

      await this.sleep(1000);

      // 再执行 disconnect
      this.logger.log('INFO', '执行 Disconnect...');
      const disconnectResponse = await fetch(`${API_BASE_URL}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: this.sessionId })
      });

      const disconnectData = await disconnectResponse.json();

      if (disconnectData.success) {
        this.logger.log('SUCCESS', '断开连接成功', disconnectData);
        this.sessionId = null;
        return true;
      } else {
        this.logger.log('ERROR', '断开连接失败', disconnectData);
        return false;
      }
    } catch (error) {
      this.logger.log('ERROR', '断开请求失败', { error: error.message });
      return false;
    }
  }

  // 测试前端界面（基础检查）
  async testFrontend() {
    this.logger.log('INFO', '=== 测试 6: 前端界面检查 ===');
    try {
      // 测试主页
      const homeResponse = await fetch(FRONTEND_URL);
      if (homeResponse.ok) {
        this.logger.log('SUCCESS', '主页可访问', { url: FRONTEND_URL });
      } else {
        this.logger.log('ERROR', '主页访问失败', { status: homeResponse.status });
      }

      // 测试 mainframe 页面
      const mainframeResponse = await fetch(`${FRONTEND_URL}/mainframe`);
      if (mainframeResponse.ok) {
        this.logger.log('SUCCESS', 'Mainframe 页面可访问', { url: `${FRONTEND_URL}/mainframe` });
        return true;
      } else {
        this.logger.log('ERROR', 'Mainframe 页面访问失败', { status: mainframeResponse.status });
        return false;
      }
    } catch (error) {
      this.logger.log('ERROR', '前端界面检查失败', { error: error.message });
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    this.logger.log('INFO', '\n\n========================================');
    this.logger.log('INFO', '  大型机自动化测试开始');
    this.logger.log('INFO', '========================================\n');

    const results = {
      backendHealth: false,
      connection: false,
      login: false,
      screen: false,
      disconnect: false,
      frontend: false
    };

    // 1. 测试后端健康
    results.backendHealth = await this.testBackendHealth();
    await this.sleep(1000);

    if (!results.backendHealth) {
      this.logger.log('ERROR', '\n后端服务不可用，测试终止');
      await this.logger.saveLogs();
      return results;
    }

    // 2. 测试大型机连接
    results.connection = await this.testMainframeConnection();
    await this.sleep(2000);

    // 3. 测试登录
    if (results.connection) {
      results.login = await this.testMainframeLogin();
      await this.sleep(2000);
    }

    // 4. 测试获取屏幕
    if (results.login) {
      results.screen = await this.testGetScreen();
      await this.sleep(1000);
    }

    // 5. 测试断开连接
    if (results.connection) {
      results.disconnect = await this.testDisconnect();
      await this.sleep(1000);
    }

    // 6. 测试前端界面
    results.frontend = await this.testFrontend();

    // 输出测试总结
    this.logger.log('INFO', '\n\n========================================');
    this.logger.log('INFO', '  测试总结');
    this.logger.log('INFO', '========================================\n');

    const passedTests = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;

    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✓ 通过' : '✗ 失败';
      const color = passed ? '\x1b[32m' : '\x1b[31m';
      console.log(`${color}${status}\x1b[0m - ${test}`);
    });

    this.logger.log('INFO', `\n总计: ${passedTests}/${totalTests} 测试通过`);

    if (passedTests === totalTests) {
      this.logger.log('SUCCESS', '\n🎉 所有测试通过！');
    } else {
      this.logger.log('WARN', `\n⚠️  ${totalTests - passedTests} 个测试失败`);
    }

    // 保存日志
    await this.logger.saveLogs();

    return results;
  }
}

// 运行测试
(async () => {
  const test = new MainframeTest();
  await test.runAllTests();
  process.exit(0);
})();
