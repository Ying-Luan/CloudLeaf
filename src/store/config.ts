import { Storage } from "@plasmohq/storage"
import { type UserConfig, DEFAULT_USER_CONFIG } from "~/src/types"

const CONFIG_KEY = "userConfig"

export const storage = new Storage({
  area: "local",
})

/**
 * 获取用户配置
 */
export async function getUserConfig(): Promise<UserConfig> {
  const config = await storage.get<UserConfig>(CONFIG_KEY)

  if (!config) {
    return { ...DEFAULT_USER_CONFIG }
  }

  // 合并默认值，确保结构完整
  return {
    gist: config.gist,
    webDavConfigs: config.webDavConfigs || [],
    customVendors: config.customVendors || [],
    lastSyncAt: config.lastSyncAt || 0,
  }
}

/**
 * 设置用户配置
 */
export async function setUserConfig(config: UserConfig): Promise<void> {
  await storage.set(CONFIG_KEY, config)
}

/**
 * 更新部分用户配置
 */
export async function updateUserConfig(updates: Partial<UserConfig>): Promise<UserConfig> {
  const current = await getUserConfig()
  const updated = { ...current, ...updates }
  await setUserConfig(updated)
  return updated
}

/**
 * 清空用户配置
 */
export async function clearUserConfig(): Promise<void> {
  await storage.remove(CONFIG_KEY)
}
