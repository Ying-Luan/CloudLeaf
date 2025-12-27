/**
 * Sync core functions
 * @module core/sync
 * @packageDocumentation
 */

import { getBookmarks } from "~/src/core/bookmark"
import { getUserConfig, updateUserConfig, loadCustomVendorsFromConfig } from "~/src/store"
import { WebDAVRegistry, GistProvider, BaseProvider } from "~/src/providers"
import { DEFAULT_FILENAME } from "~/src/constants"
import { type Result, type SyncPayload, type SyncStatus } from "~/src/types"

/**
 * Compare local and remote payloads to determine the sync state
 * @param local Local payload containing update timestamp
 * @param remote Remote payload containing update timestamp
 * @returns the sync status: `'ahead'`, `'behind'`, or `'synced'`
 */
function getSyncStatus(local: SyncPayload, remote: SyncPayload): SyncStatus {
  if (local.updatedAt > remote.updatedAt) return 'ahead';
  if (local.updatedAt < remote.updatedAt) return 'behind';
  return 'synced';
}

/**
 * Build providers from user config
 * @returns 
 * - providers sorted providers by priority
 * - config user config
 */
async function buildProviders() {
  const config = await getUserConfig()
  const providers: Array<{ provider: BaseProvider; priority: number }> = []

  // --- Gist Provider ---
  if (config.gist && config.gist.enabled) {
    const fileName = config.gist.fileName || DEFAULT_FILENAME
    const gist = new GistProvider(config.gist.accessToken, config.gist.gistId, fileName)
    providers.push({ provider: gist, priority: config.gist.priority ?? Number.MAX_SAFE_INTEGER })
  }

  // --- WebDAV Providers ---
  for (const w of config.webDavConfigs || []) {
    if (w.enabled === false) continue
    try {
      loadCustomVendorsFromConfig(config)
      const provider = WebDAVRegistry.createProvider(w.vendorId, w)
      providers.push({ provider, priority: w.priority ?? Number.MAX_SAFE_INTEGER })
    } catch {
      // skip invalid config
    }
  }

  return { providers: providers.sort((a, b) => a.priority - b.priority), config }
}

/**
 * Upload bookmarks: local -> cloud
 * @param force whether to force upload even if cloud is newer
 * @returns sync status
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 * @see {@link ~src/hooks/useSync.ts useSync}
 */
export async function uploadBookmarks(force = false): Promise<Result<{ status: SyncStatus }>> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0) return { success: true, data: { status: 'none' } }
    const local = await getBookmarks()

    // --- Check if any cloud is newer ---
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

    // --- Proceed to upload to all providers ---
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

    // success!
    if (successCount > 0) {
      await updateUserConfig({ lastSyncAt: Date.now() })
      return { success: true, data: { status: 'synced' } }
    }

    // fail or error
    return { success: false, error: errors.join("\n") || "所有提供者上传失败" }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Download bookmarks: cloud -> local
 * @returns 
 * - sync status 
 * - sync payload if applicable
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 * @see {@link ~src/hooks/useSync.ts useSync}
 */
export async function downloadBookmarks(): Promise<Result<{ status: SyncStatus; payload?: SyncPayload }>> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0) return { success: true, data: { status: 'none' } }
    const local = await getBookmarks()
    const errors: string[] = []

    for (const item of providers) {
      const res = await item.provider.download()
      if (res.success && res.data) {
        const cloud = res.data
        const status = getSyncStatus(local, cloud)
        return { success: true, data: { status, payload: cloud } }
      }
      errors.push(`${item.provider.name}: ${res.error || "下载失败"}`)
    }

    return { success: false, error: errors.join("\n") || "无可用同步源数据" }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
