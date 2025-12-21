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
    githubAccessToken: (await storage.get("githubAccessToken")) || "",
    githubGistId: (await storage.get("githubGistId")) || "",
    githubGistFileName: (await storage.get("githubGistFileName")) || "CloudLeaf.json",
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
