/**
 * Playwright 配置文件
 * @see https://playwright.dev/docs/test-configuration
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: '**/*.spec.js',

  // 超时配置
  timeout: 120000, // 2 分钟（TSO 登录很慢）
  expect: {
    timeout: 10000 // expect 超时 10 秒
  },

  // 失败后重试
  retries: 0, // 不自动重试，因为大型机连接可能有状态

  // 并发工作器数量
  workers: 1, // 顺序执行，避免会话冲突

  // 报告器
  reporter: [
    ['html', { outputFolder: 'test-logs/playwright-report' }],
    ['json', { outputFile: 'test-logs/playwright-results.json' }],
    ['list']
  ],

  // 全局设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000',

    // 截图设置
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 追踪
    trace: 'retain-on-failure',

    // 浏览器上下文选项
    viewport: { width: 1920, height: 1080 },

    // 忽略 HTTPS 错误
    ignoreHTTPSErrors: true,

    // 慢动作（调试用）
    // launchOptions: {
    //   slowMo: 100
    // }
  },

  // 项目配置（浏览器）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 可以添加其他浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  // Web 服务器
  // 如果需要自动启动服务器，取消注释：
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },

  // 输出目录
  outputDir: 'test-logs/playwright-artifacts',
});
