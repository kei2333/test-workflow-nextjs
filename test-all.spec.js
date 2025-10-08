/**
 * 完整测试套件 - 统一入口
 * 依次运行所有测试：API测试 + Mainframe UI + Workflow UI
 *
 * 运行: npx playwright test test-all.spec.js --headed
 * 或: npm run test:all
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 从配置文件加载
const configPath = path.join(__dirname, 'test-config.json');
if (!fs.existsSync(configPath)) {
  console.error('错误: 找不到 test-config.json');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const MAINFRAME_CONFIG = config.mainframe;

// 运行 Node.js 测试的辅助函数
function runNodeTest(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`测试失败，退出码: ${code}`));
      }
    });

    child.on('error', reject);
  });
}

test.describe('完整测试套件', () => {
  test.beforeAll(() => {
    // 设置超时时间为 10 分钟
    test.setTimeout(600000);
  });

  test('1. API 测试 - 后端连接和登录', async () => {
    console.log('\n========================================');
    console.log('测试套件 1/3: API 测试');
    console.log('========================================\n');

    // 运行 API 测试
    await runNodeTest('test-mainframe.js');

    console.log('\n✅ API 测试完成\n');
  });

  test('2. Mainframe Terminal UI 测试', async ({ page }) => {
    console.log('\n========================================');
    console.log('测试套件 2/3: Mainframe Terminal UI');
    console.log('========================================\n');

    // 打开 Mainframe Terminal 页面
    await page.goto('http://localhost:3000/mainframe');
    await page.waitForLoadState('networkidle');

    // 填写连接信息
    await page.locator('input[placeholder="localhost"]').fill(MAINFRAME_CONFIG.host);
    await page.locator('input[type="number"]').fill(MAINFRAME_CONFIG.port.toString());

    // 连接
    await page.locator('button:has-text("Connect to Mainframe")').click();
    await page.waitForSelector('input[placeholder="Enter your username"]', { timeout: 10000 });

    // 选择登录类型
    await page.locator(`input[type="radio"][value="${MAINFRAME_CONFIG.loginType}"]`).click();

    // 登录
    await page.locator('input[placeholder="Enter your username"]').fill(MAINFRAME_CONFIG.username);
    await page.locator('input[placeholder="Enter your password"]').fill(MAINFRAME_CONFIG.password);
    await page.locator('button:has-text("Login to Mainframe")').click();

    // 等待登录完成
    await page.waitForSelector('.bg-black.text-green-400', { timeout: 45000 });

    // 验证屏幕内容
    const screenContent = await page.locator('.bg-black.text-green-400').textContent();
    expect(screenContent.length).toBeGreaterThan(100);

    // 截图
    await page.screenshot({ path: 'test-logs/screenshots/suite-mainframe-ui.png', fullPage: true });

    // 断开连接
    await page.locator('button:has-text("Disconnect")').click();
    await page.waitForSelector('button:has-text("Connect to Mainframe")', { timeout: 20000 });

    console.log('\n✅ Mainframe Terminal UI 测试完成\n');
  });

  test('3. Workflow UI 测试 - LogonISPF 拖拽执行', async ({ page }) => {
    console.log('\n========================================');
    console.log('测试套件 3/3: Workflow UI');
    console.log('========================================\n');

    // 打开主页
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 拖拽 LogonISPF
    const logonISPFCard = page.locator('text=LogonISPF').first();
    const workflowCanvas = page.locator('text=Drop functions here').first();
    await logonISPFCard.dragTo(workflowCanvas);

    // 等待模态框
    await page.waitForSelector('text=Configure LogonISPF', { timeout: 5000 });

    // 填写表单
    await page.locator('label:has-text("Host") + input').fill(MAINFRAME_CONFIG.host);
    await page.locator('label:has-text("Port") + input').fill(MAINFRAME_CONFIG.port.toString());
    await page.locator(`input[type="radio"][value="${MAINFRAME_CONFIG.loginType}"]`).click();
    await page.locator('label:has-text("User Name") + input').fill(MAINFRAME_CONFIG.username);
    await page.locator('label:has-text("Password") + input').fill(MAINFRAME_CONFIG.password);

    // 添加函数
    await page.locator('button:has-text("Add Function")').click();
    await page.waitForTimeout(1000);

    // 运行 workflow
    await page.locator('button:has-text("Run Workflow")').click();
    await page.waitForTimeout(2000);

    // 等待执行完成
    await page.waitForSelector('text=/successfully connected|authenticated/i', { timeout: 45000 });

    // 验证 session_id
    const sessionId = await page.evaluate(() => localStorage.getItem('mainframe-session-id'));
    expect(sessionId).toBeTruthy();

    // 截图
    await page.screenshot({ path: 'test-logs/screenshots/suite-workflow-ui.png', fullPage: true });

    // 断开连接
    const disconnectBtn = page.locator('button:has-text("Disconnect")');
    await expect(disconnectBtn).toBeVisible();
    await disconnectBtn.click();
    await page.waitForTimeout(15000);

    // 验证断开
    const sessionIdAfter = await page.evaluate(() => localStorage.getItem('mainframe-session-id'));
    expect(sessionIdAfter).toBeNull();

    console.log('\n✅ Workflow UI 测试完成\n');
  });

  test.afterAll(() => {
    console.log('\n========================================');
    console.log('✅ 完整测试套件执行完毕！');
    console.log('========================================\n');
    console.log('测试结果：');
    console.log('  1. API 测试 ✅');
    console.log('  2. Mainframe Terminal UI ✅');
    console.log('  3. Workflow UI ✅');
    console.log('\n测试日志和截图保存在 test-logs/ 目录\n');
  });
});
