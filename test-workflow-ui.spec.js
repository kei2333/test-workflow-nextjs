/**
 * 主页 LogonISPF Workflow 拖拽执行测试
 * 使用 Playwright 进行浏览器自动化测试
 *
 * 安装: npm install -D @playwright/test
 * 运行: npx playwright test test-workflow-ui.spec.js --headed
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// 从配置文件加载
const configPath = path.join(__dirname, 'test-config.json');
if (!fs.existsSync(configPath)) {
  console.error('错误: 找不到 test-config.json');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const MAINFRAME_CONFIG = config.mainframe;

test.describe('主页 Workflow 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置较长的超时时间
    test.setTimeout(150000); // 2.5 分钟
  });

  test('LogonISPF 拖拽到 workflow 并执行', async ({ page }) => {
    console.log('\n========================================');
    console.log('LogonISPF Workflow 拖拽执行测试');
    console.log('========================================\n');

    // 1. 打开主页
    console.log('步骤 1: 打开主页');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-logs/screenshots/workflow-01-homepage.png' });

    // 2. 验证页面元素
    console.log('步骤 2: 验证页面元素');
    await expect(page.locator('h1:has-text("Test Workflow Generator")')).toBeVisible();
    await expect(page.locator('h3:has-text("Functions")')).toBeVisible();
    await expect(page.locator('h3:has-text("Execution Log")')).toBeVisible();

    // 3. 找到 LogonISPF 函数
    console.log('步骤 3: 找到 LogonISPF 函数');
    const logonISPFCard = page.locator('text=LogonISPF').first();
    await expect(logonISPFCard).toBeVisible();
    await page.screenshot({ path: 'test-logs/screenshots/workflow-02-logonispf-found.png' });

    // 4. 拖拽 LogonISPF 到 workflow canvas
    console.log('步骤 4: 拖拽 LogonISPF 到 workflow canvas');
    const workflowCanvas = page.locator('text=Drop functions here').first();

    // 使用 dragTo 进行拖拽
    await logonISPFCard.dragTo(workflowCanvas);

    // 5. 等待配置模态框出现
    console.log('步骤 5: 等待配置模态框出现');
    const modal = page.locator('text=Configure LogonISPF');
    await modal.waitFor({ timeout: 5000, state: 'visible' });
    await page.screenshot({ path: 'test-logs/screenshots/workflow-03-modal-opened.png' });

    // 6. 填写 Host
    console.log(`步骤 6: 填写 Host: ${MAINFRAME_CONFIG.host}`);
    const hostInput = page.locator('label:has-text("Host") + input');
    await hostInput.fill(MAINFRAME_CONFIG.host);

    // 7. 填写 Port
    console.log(`步骤 7: 填写 Port: ${MAINFRAME_CONFIG.port}`);
    const portInput = page.locator('label:has-text("Port") + input');
    await portInput.fill(MAINFRAME_CONFIG.port.toString());

    // 8. 选择 Login Type
    console.log(`步骤 8: 选择 Login Type: ${MAINFRAME_CONFIG.loginType}`);
    const loginTypeRadio = page.locator(`input[type="radio"][value="${MAINFRAME_CONFIG.loginType}"]`);
    await loginTypeRadio.click();

    // 9. 填写 User Name
    console.log(`步骤 9: 填写 User Name: ${MAINFRAME_CONFIG.username}`);
    const userInput = page.locator('label:has-text("User Name") + input');
    await userInput.fill(MAINFRAME_CONFIG.username);

    // 10. 填写 Password
    console.log('步骤 10: 填写 Password');
    const passwordInput = page.locator('label:has-text("Password") + input');
    await passwordInput.fill(MAINFRAME_CONFIG.password);
    await page.screenshot({ path: 'test-logs/screenshots/workflow-04-form-filled.png' });

    // 11. 点击 Add Function
    console.log('步骤 11: 点击 Add Function');
    const addButton = page.locator('button:has-text("Add Function")');
    await addButton.click();

    // 12. 验证函数已添加到 workflow
    console.log('步骤 12: 验证函数已添加到 workflow');
    await page.waitForTimeout(1000);
    const workflowItem = page.locator('text=LogonISPF').nth(1); // workflow 中的项
    await expect(workflowItem).toBeVisible();
    await page.screenshot({ path: 'test-logs/screenshots/workflow-05-function-added.png' });

    // 13. 点击 Run Workflow 按钮
    console.log('步骤 13: 点击 Run Workflow');
    const runButton = page.locator('button:has-text("Run Workflow")');
    await expect(runButton).toBeVisible();
    await runButton.click();

    // 14. 观察执行日志
    console.log('步骤 14: 观察执行日志（等待执行完成，约 30-40 秒）');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-logs/screenshots/workflow-06-executing.png' });

    // 15. 等待执行完成
    console.log('步骤 15: 等待工作流执行完成...');
    // 等待成功消息出现
    await page.waitForSelector('text=/successfully connected|authenticated/i', {
      timeout: 45000
    });

    // 16. 验证执行日志
    console.log('步骤 16: 验证执行日志');
    const executionLog = page.locator('.text-xs.text-gray-700');
    const logCount = await executionLog.count();
    console.log(`  执行日志数量: ${logCount} 条`);
    expect(logCount).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-logs/screenshots/workflow-07-completed.png', fullPage: true });

    // 17. 验证 session_id 已存储
    console.log('步骤 17: 验证 session_id 已存储到 localStorage');
    const sessionId = await page.evaluate(() => {
      return localStorage.getItem('mainframe-session-id');
    });
    expect(sessionId).toBeTruthy();
    console.log(`  Session ID: ${sessionId?.substring(0, 20)}...`);

    // 18. 检查断开按钮是否显示
    console.log('步骤 18: 检查主页断开按钮');
    const disconnectBtn = page.locator('button:has-text("Disconnect")');
    await expect(disconnectBtn).toBeVisible();
    await page.screenshot({ path: 'test-logs/screenshots/workflow-08-disconnect-visible.png' });

    // 19. 点击断开按钮
    console.log('步骤 19: 点击 Disconnect 按钮');
    await disconnectBtn.click();

    // 20. 等待断开完成
    console.log('步骤 20: 等待断开完成（约 12-15 秒）...');
    await page.waitForTimeout(15000);

    // 21. 验证断开成功
    console.log('步骤 21: 验证断开成功');
    const sessionIdAfter = await page.evaluate(() => {
      return localStorage.getItem('mainframe-session-id');
    });
    expect(sessionIdAfter).toBeNull();

    // 断开按钮应该消失
    await expect(disconnectBtn).not.toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-logs/screenshots/workflow-09-disconnected.png' });

    console.log('\n✅ LogonISPF Workflow 测试完成！');
    console.log('========================================\n');
  });

  test('清空 workflow 和日志', async ({ page }) => {
    console.log('\n测试清空功能');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 如果有 workflow 项目，删除它
    const removeButton = page.locator('button[aria-label*="Remove"]').first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
    }

    // 清空日志
    const clearLogsButton = page.locator('button:has-text("Clear")');
    if (await clearLogsButton.isVisible()) {
      await clearLogsButton.click();
    }

    console.log('✅ 清空测试通过');
  });

  test('验证 Mainframe Terminal 按钮导航', async ({ page }) => {
    console.log('\n测试 Mainframe Terminal 按钮');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 点击 Mainframe Terminal 按钮
    const mainframeButton = page.locator('a:has-text("Mainframe Terminal")');
    await expect(mainframeButton).toBeVisible();

    await mainframeButton.click();

    // 验证跳转到 mainframe 页面
    await page.waitForURL('**/mainframe', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2:has-text("IBM Mainframe Terminal")')).toBeVisible({ timeout: 15000 });

    console.log('✅ 导航测试通过');
  });
});
