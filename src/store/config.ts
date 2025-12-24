import { Storage } from "@plasmohq/storage"
import { type UserConfig } from "~src/types"


export const storage = new Storage({
  area: "local",
})

/**
 * 获取用户配置
 */
export async function getUserConfig(): Promise<UserConfig> {
  return {
    gist: {
      enabled: (await storage.get("gistEnabled")) || false,
      accessToken: (await storage.get("gistAccessToken")) || "",
      gistId: (await storage.get("gistGistId")) || "",
      fileName: (await storage.get("gistFileName")) || "CloudLeaf.json",
    },
    jianguoyun: {
      enabled: (await storage.get("jianguoyunEnabled")) || false,
      serverUrl: (await storage.get("jianguoyunServerUrl")) || "https://dav.jianguoyun.com/dav",
      username: (await storage.get("jianguoyunUsername")) || "",
      password: (await storage.get("jianguoyunPassword")) || "",
      filePath: (await storage.get("jianguoyunFilePath")) || "/CloudLeaf/bookmarks.json",
    },
    customWebdav: [],
    lastSyncAt: (await storage.get("lastSyncAt")) || 0,
  }
}

/**
 * 设置用户配置
 */
export async function setUserConfig(config: Partial<UserConfig>): Promise<void> {
  const tasks = Object.entries(config).map(([key, value]) => {
    if (value)
      return storage.set(key as keyof UserConfig, value)
  })
  await Promise.all(tasks)
}
