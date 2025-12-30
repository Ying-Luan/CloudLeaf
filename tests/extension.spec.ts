import { test, expect, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'

// 1. 指向你的构建产物目录 (Plasmo 默认为 build/chrome-mv3-dev)
const extensionPath = path.join(__dirname, '../build/edge-mv3-dev')

test.describe('CloudLeaf Extension Test', () => {
  let context: BrowserContext
  let extensionId: string

  test.beforeEach(async () => {
    // 2. 启动浏览器 (必须用 launchPersistentContext)
    context = await chromium.launchPersistentContext('', {
      headless: false, // 扩展测试不能用 headless 模式
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    })

    // 3. ★★★ 核心魔法：动态获取插件 ID ★★★
    // 先检查是否已经有 Service Worker 在运行了
    let [worker] = context.serviceWorkers()

    // 如果还没启动，就等待它启动
    if (!worker) {
      worker = await context.waitForEvent('serviceworker')
    }

    // 4. 从 URL 中解析 ID
    // worker.url() 长这样: chrome-extension://<随机ID>/background.js
    const url = worker.url()
    extensionId = url.split('/')[2]

    console.log(`🎯 捕获到动态插件 ID: ${extensionId}`)
  });

  test.afterEach(async () => {
    await context.close()
  })

  // --- 开始写测试 ---

  test('Popup 页面应该能加载', async ({ page }) => {
    // 5. 使用获取到的 extensionId 拼接地址
    const popupPage = await context.newPage()
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)

    // 验证页面内容
    // 假设你的首页有个标题叫 "CloudLeaf"
    // await expect(popupPage.getByText('CloudLeaf')).toBeVisible();

    // 简单验证：页面标题不为空
    const title = await popupPage.title()
    console.log('Popup Title:', title)
    expect(title).not.toBe('')
  });

  test('Options 设置页测试', async () => {
    const optionsPage = await context.newPage()
    await optionsPage.goto(`chrome-extension://${extensionId}/options.html`)

    // 在这里写你的设置页测试逻辑...
  })
})
