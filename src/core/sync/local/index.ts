/**
 * Local Sync Module
 * @module core/sync/local
 * @packageDocumentation
 */

import { getBookmarks } from "~/src/core/bookmark"
import { LocalProvider } from "~/src/providers"
import { type Result, type SyncStatus, type SyncPayload } from "~/src/types"
import { getSyncStatus } from "~/src/core/sync/utils"

const provider = new LocalProvider()

/**
 * Export browser bookmarks to a local JSON file
 * @returns sync status
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 * @see {@link ~src/hooks/useSync.ts useSync}
 */
export async function exportBookmarks(): Promise<Result<{ status: SyncStatus }>> {
  try {
    const data = await getBookmarks()
    const res = await provider.upload(data)

    if (!res.ok)
      return { ok: false, error: res.error || "Export failed" }

    return { ok: true, data: { status: 'synced' } }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Export failed" }
  }
}

/**
 * Import bookmarks from a local JSON file
 * @returns sync status and payload
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 * @see {@link ~src/hooks/useSync.ts useSync}
 */
export async function importBookmarks(): Promise<Result<{ status: SyncStatus, payload?: SyncPayload }>> {
  try {
    const res = await provider.download()
    if (process.env.NODE_ENV === 'development')
      console.log("[core/sync/local] Successfully downloaded file from localProvider")
    if (!res.ok || !res.data) {
      return {
        ok: false,
        error: res.error || "Import failed"
      }
    }

    const file = res.data
    const browser = await getBookmarks()
    const status = getSyncStatus(browser, file)
    return { ok: true, data: { status, payload: file } }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Import failed" }
  }
}
