/**
 * Mainframe Terminal UI 自动化测试
 * 使用 Playwright 进行浏览器自动化测试
 *
 * 安装: npm install -D @playwright/test
 * 运行: npx playwright test test-mainframe-ui.spec.js --headed
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

test.describe('Mainframe Terminal 页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置较长的超时时间（TSO 登录很慢）
    test.setTimeout(120000); // 2 分钟
  });

  test('完整的连接-登录-断开流程', async ({ page }) => {
    console.log('\n========================================');
    console.log('Mainframe Terminal UI 自动化测试');
    console.log('========================================\n');

    // 1. 打开 Mainframe Terminal 页面
    console.log('步骤 1: 打开 Mainframe Terminal 页面');
    await page.goto('http://localhost:3000/mainframe');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-logs/screenshots/01-page-loaded.png' });

    // 2. 验证页面标题
    console.log('步骤 2: 验证页面标题');
    await expect(page.locator('h2:has-text("IBM Mainframe Terminal")')).toBeVisible();

    // 3. 选择 Custom Mainframe（应该已经默认选中）
    console.log('步骤 3: 确认 Custom Mainframe 选中');
    const customRadio = page.locator('input[type="radio"][value="custom"]');
    if (!await customRadio.isChecked()) {
      await customRadio.click();
    }
    await page.screenshot({ path: 'test-logs/screenshots/02-custom-selected.png' });

    // 4. 输入主机地址
    console.log(`步骤 4: 输入主机地址 ${MAINFRAME_CONFIG.host}`);
    const hostInput = page.locator('input[placeholder="localhost"]');
    await hostInput.clear();
    await hostInput.fill(MAINFRAME_CONFIG.host);

    // 5. 输入端口
    console.log(`步骤 5: 输入端口 ${MAINFRAME_CONFIG.port}`);
    const portInput = page.locator('input[type="number"]');
    await portInput.clear();
    await portInput.fill(MAINFRAME_CONFIG.port.toString());
    await page.screenshot({ path: 'test-logs/screenshots/03-connection-info.png' });

    // 6. 点击连接按钮
    console.log('步骤 6: 点击 Connect to Mainframe');
    const connectButton = page.locator('button:has-text("Connect to Mainframe")');
    await expect(connectButton).toBeEnabled();
    await connectButton.click();

    // 7. 等待登录表单出现
    console.log('步骤 7: 等待登录表单出现...');
    await page.waitForSelector('input[placeholder="Enter your username"]', {
      timeout: 10000,
      state: 'visible'
    });
    await page.screenshot({ path: 'test-logs/screenshots/04-login-form.png' });

    // 8. 验证连接成功
    console.log('步骤 8: 验证连接状态');
    await expect(page.locator('text=Connected')).toBeVisible();

    // 9. 选择登录类型
    console.log(`步骤 9: 选择登录类型 ${MAINFRAME_CONFIG.loginType.toUpperCase()}`);
    const loginTypeRadio = page.locator(`input[type="radio"][value="${MAINFRAME_CONFIG.loginType}"]`);
    await loginTypeRadio.click();
    await page.screenshot({ path: 'test-logs/screenshots/05-login-type.png' });

    // 10. 输入用户名
    console.log(`步骤 10: 输入用户名 ${MAINFRAME_CONFIG.username}`);
    const usernameInput = page.locator('input[placeholder="Enter your username"]');
    await usernameInput.fill(MAINFRAME_CONFIG.username);

    // 11. 输入密码
    console.log('步骤 11: 输入密码');
    const passwordInput = page.locator('input[placeholder="Enter your password"]');
    await passwordInput.fill(MAINFRAME_CONFIG.password);
    await page.screenshot({ path: 'test-logs/screenshots/06-credentials.png' });

    // 12. 点击登录按钮
    console.log('步骤 12: 点击 Login to Mainframe');
    const loginButton = page.locator('button:has-text("Login to Mainframe")');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // 13. 等待登录完成（TSO 登录需要约 30 秒）
    console.log('步骤 13: 等待 TSO 登录完成（约 30-40 秒）...');
    const terminalScreen = page.locator('.bg-black.text-green-400');
    await terminalScreen.waitFor({
      timeout: 45000,
      state: 'visible'
    });

    // 14. 验证屏幕内容
    console.log('步骤 14: 验证终端屏幕内容');
    const screenContent = await terminalScreen.textContent();
    expect(screenContent.length).toBeGreaterThan(100);
    console.log(`  屏幕内容长度: ${screenContent.length} 字符`);
    console.log(`  屏幕预览: ${screenContent.substring(0, 100)}...`);
    await page.screenshot({ path: 'test-logs/screenshots/07-logged-in.png', fullPage: true });

    // 15. 验证已登录状态
    console.log('步骤 15: 验证登录状态');
    await expect(page.locator('text=Connected')).toBeVisible();
    await expect(page.locator('button:has-text("Disconnect")')).toBeVisible();

    // 16. 等待几秒查看屏幕
    console.log('步骤 16: 查看屏幕内容（等待 3 秒）');
    await page.waitForTimeout(3000);

    // 17. 点击刷新按钮（可选）
    console.log('步骤 17: 点击 Refresh 查看屏幕更新');
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'test-logs/screenshots/08-after-refresh.png' });

    // 18. 点击断开连接
    console.log('步骤 18: 点击 Disconnect');
    const disconnectButton = page.locator('button:has-text("Disconnect")');
    await disconnectButton.click();

    // 19. 等待断开完成（TSO logout + disconnect 约 12 秒）
    console.log('步骤 19: 等待优雅断开（TSO logout + disconnect，约 12-15 秒）...');
    await page.waitForSelector('button:has-text("Connect to Mainframe")', {
      timeout: 20000,
      state: 'visible'
    });

    // 20. 验证已断开
    console.log('步骤 20: 验证断开成功');
    await expect(page.locator('text=Disconnected')).toBeVisible();
    await expect(page.locator('button:has-text("Connect to Mainframe")')).toBeEnabled();
    await page.screenshot({ path: 'test-logs/screenshots/09-disconnected.png' });

    console.log('\n✅ Mainframe Terminal UI 测试完成！');
    console.log('========================================\n');
  });

  test('错误处理：无效的主机地址', async ({ page }) => {
    console.log('\n测试错误处理: 无效的主机地址');

    await page.goto('http://localhost:3000/mainframe');
    await page.waitForLoadState('networkidle');

    // 输入无效地址
    await page.locator('input[placeholder="localhost"]').fill('invalid.host.test');
    await page.locator('input[type="number"]').fill('9999');

    // 点击连接
    await page.locator('button:has-text("Connect to Mainframe")').click();

    // 等待错误消息
    await page.waitForSelector('text=/error|failed|cannot connect/i', { timeout: 10000 });

    console.log('✅ 错误处理测试通过');
  });
});
