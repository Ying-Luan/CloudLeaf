import { getBookmarks } from "~/src/core/bookmark"
import { getUserConfig, updateUserConfig } from "~/src/store"
import { WebDAVRegistry, GistProvider, BaseProvider } from "~/src/providers"
import { DEFAULT_FILENAME } from "~/src/constants"
import { type Result, type SyncPayload, type SyncStatus } from "~/src/types"
import { loadCustomVendorsFromConfig } from "~/src/store"


function getSyncStatus(local: SyncPayload, remote: SyncPayload): SyncStatus {
  if (local.updatedAt > remote.updatedAt) return 'ahead';
  if (local.updatedAt < remote.updatedAt) return 'behind';
  return 'synced';
}

async function buildProviders() {
  const config = await getUserConfig()
  const providers: Array<{ provider: BaseProvider; priority: number }> = []

  if (config.gist && config.gist.enabled) {
    const fileName = config.gist.fileName || DEFAULT_FILENAME
    const gist = new GistProvider(config.gist.accessToken, config.gist.gistId, fileName)
    providers.push({ provider: gist, priority: config.gist.priority ?? Number.MAX_SAFE_INTEGER })
  }

  for (const w of config.webDavConfigs || []) {
    if (w.enabled === false) continue
    try {
      loadCustomVendorsFromConfig(config)
      const provider = WebDAVRegistry.createProvider(w.vendorId, w)
      providers.push({ provider, priority: w.priority ?? Number.MAX_SAFE_INTEGER })
    } catch {
      // 忽略无法创建的 provider
    }
  }

  return { providers: providers.sort((a, b) => a.priority - b.priority), config }
}

/**
 * 上传逻辑：本地 -> 云端
 * @param force 是否强制覆盖
 */
export async function uploadBookmarks(force = false): Promise<Result<{ status: SyncStatus }>> {
  try {
    const { providers } = await buildProviders()
    if (providers.length === 0) return { success: true, data: { status: 'none' } }

    const local = await getBookmarks()

    // 1. 风险预检：防止误覆盖云端的更新
    if (!force) {
      for (const item of providers) {
        const res = await item.provider.download()
        if (res.success && res.data) {
          if (getSyncStatus(local, res.data) === 'behind') {
            return { success: true, data: { status: 'behind' } }
          }
        }
      }
    }

    // 2. 执行上传
    const errors: string[] = []
    let successCount = 0

    for (const item of providers) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Start uploading to ${item.provider.name}...`)
      }
      const res = await item.provider.upload(local)
      if (res.success) {
        successCount++
      } else {
        errors.push(`${item.provider.name}: ${res.error || "上传失败"}`)
      }
    }

    if (successCount > 0) {
      await updateUserConfig({ lastSyncAt: Date.now() })
      return { success: true, data: { status: 'synced' } }
    }

    // 去掉了分号，改用换行符，UI 展示更友好
    return { success: false, error: errors.join("\n") || "所有提供者上传失败" }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * 下载书签：云端 -> 本地（仅获取数据与状态）
 */
export async function downloadBookmarks(): Promise<Result<{ status: SyncStatus; payload?: SyncPayload }>> {
  try {
    const { providers } = await buildProviders()
    if (providers.length === 0) return { success: true, data: { status: 'none' } }

    const local = await getBookmarks()
    const errors: string[] = []

    for (const item of providers) {
      const res = await item.provider.download()

      if (res.success && res.data) {
        const cloud = res.data
        const status = getSyncStatus(local, cloud)

        // 2. 直接返回：状态判定与数据一并交给外部 apply 逻辑处理
        return { success: true, data: { status, payload: cloud } }
      }

      errors.push(`${item.provider.name}: ${res.error || "下载失败"}`)
    }

    return { success: false, error: errors.join("\n") || "无可用同步源数据" }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
