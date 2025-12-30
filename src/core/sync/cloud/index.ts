/**
 * Cloud Sync Module
 * @module core/sync/cloud
 * @packageDocumentation
 */

import { getBookmarks } from "~/src/core/bookmark"
import { getUserConfig, loadCustomVendorsFromConfig } from "~/src/store"
import { WebDAVRegistry, GistProvider, BaseProvider } from "~/src/providers"
import { DEFAULT_FILENAME, HttpStatus, WebDAVStatus } from "~/src/constants"
import { type Result, type SyncPayload, type SyncStatus } from "~/src/types"
import { getSyncStatus } from "~/src/core/sync/utils"

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
 * Upload bookmarks: local browser -> cloud
 * @param force whether to force upload even if cloud is newer
 * @returns sync status
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 * @see {@link ~src/hooks/useSync.ts useSync}
 */
export async function uploadBookmarks(force = false): Promise<Result<{ status: SyncStatus }>> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0) return { ok: true, data: { status: 'none' } }
    const local = await getBookmarks()

    // --- Check if any cloud is newer ---
    if (!force) {
      for (const item of providers) {
        if (process.env.NODE_ENV === "development") console.log(`[core/sync/cloud] Start uploading to ${item.provider.name} when force = ${force}`)
        const res = await item.provider.download()
        if (res.ok && res.data) {
          if (getSyncStatus(local, res.data) === 'behind') {
            return { ok: true, data: { status: 'behind' } }
          }
        } else {
          // If file or folder not found, continue to upload
          if (res.status === HttpStatus.NOT_FOUND || res.status === WebDAVStatus.CONFLICT) return { ok: true, data: { status: 'synced' } }
          if (process.env.NODE_ENV === "development") console.error(`[core/sync/cloud] Download from ${item.provider.name} failed during upload check`)
          return { ok: false, error: `Failed to check sync status from ${item.provider.name}: ${res.error || "下载失败"}` }
        }
      }
      return { ok: true, data: { status: 'synced' } }
    }

    // --- Proceed to upload to all providers ---
    const errors: string[] = []
    let successCount = 0
    for (const item of providers) {
      if (process.env.NODE_ENV === "development") console.log(`[core/sync/cloud] Start uploading to ${item.provider.name} when force = ${force}`)
      const res = await item.provider.upload(local)
      if (res.ok) {
        successCount++
      } else {
        if (process.env.NODE_ENV === "development") console.error(`[core/sync/cloud] Upload to ${item.provider.name} failed`)
        errors.push(`${item.provider.name}: ${res.error || "上传失败"}`)
      }
    }

    // success!
    if (successCount > 0) {
      return { ok: true, data: { status: 'synced' } }
    }

    // fail or error
    return { ok: false, error: errors.join("\n") || "所有提供者上传失败" }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}

/**
 * Download bookmarks: cloud -> local browser
 * @returns 
 * - sync status
 * - sync payload if applicable
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 * @see {@link ~src/hooks/useSync.ts useSync}
 */
export async function downloadBookmarks(): Promise<Result<{ status: SyncStatus, payload?: SyncPayload }>> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0) return { ok: true, data: { status: 'none' } }
    const local = await getBookmarks()
    const errors: string[] = []

    for (const item of providers) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[core/sync/cloud] Start downloading from ${item.provider.name}...`)
      }
      const res = await item.provider.download()
      if (res.ok && res.data) {
        const cloud = res.data
        const status = getSyncStatus(local, cloud)
        return { ok: true, data: { status, payload: cloud } }
      }
      errors.push(`${item.provider.name}: ${res.error || "下载失败"}`)
    }

    return { ok: false, error: errors.join("\n") || "无可用同步源数据" }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
