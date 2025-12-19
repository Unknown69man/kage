import { chromium } from 'playwright'
import fs from 'fs'

const SESSION_DIR = './terabox-session'

export async function getAuthBrowser() {
  const enabled = process.env.PLAYWRIGHT_AUTH_ENABLED !== '0'
  if (!enabled) {
    throw new Error('Playwright-based auth is disabled. Set PLAYWRIGHT_AUTH_ENABLED=1 to enable.')
  }

  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR)
  }

  const headless = process.env.PLAYWRIGHT_HEADLESS === '1'

  return chromium.launchPersistentContext(SESSION_DIR, {
    headless: headless,
    viewport: { width: 1280, height: 800 }
  })
}
