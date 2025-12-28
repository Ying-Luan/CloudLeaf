import { useState } from "react"
import { uploadBookmarks, downloadBookmarks, exportBookmarks, importBookmarks } from "~src/core/sync"
import { type SyncStatus, type Result, type SyncPayload } from "~src/types"

/**
 * Hook that provides sync actions and state for UI use.
 * @returns
 * - `loading`: whether a sync operation is in progress
 * - `error`: last error message if any
 * - `performUpload(force?)`: upload local bookmarks to configured providers
 * - `performDownload()`: download bookmarks from providers
 */
export function useSync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Perform upload of local bookmarks to cloud providers.
   * @param force When true, upload even if remote appears newer
   * @returns Result object containing sync `status` on success or `error` on failure
   */
  const performUpload = async (force = false): Promise<Result<{ status: SyncStatus }>> => {
    setLoading(true)
    setError(null)
    try {
      const res = await uploadBookmarks(force)
      if (!res.success) {
        setError(res.error || "上传失败")
      }
      return res
    } catch (e) {
      const msg = String(e)
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Perform download from configured providers and return payload if available.
   * @returns Result object containing `status` and optional `payload` when successful
   */
  const performDownload = async (): Promise<Result<{ status: SyncStatus; payload?: SyncPayload }>> => {
    setLoading(true)
    setError(null)
    try {
      const res = await downloadBookmarks()
      if (!res.success) {
        setError(res.error || "下载失败")
      }
      return res
    } catch (e) {
      const msg = String(e)
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Perform export of bookmarks to a local file.
   * @returns Result object containing sync `status` on success or `error` on failure
   */
  const performExport = async (): Promise<Result<{ status: SyncStatus }>> => {
    setLoading(true)
    setError(null)
    try {
      const res = await exportBookmarks()
      if (!res.success) {
        setError(res.error || "导出失败")
      }
      return res
    } catch (e) {
      const msg = String(e)
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Perform import of bookmarks from a local file.
   * @returns Result object containing `status` and optional `payload` when importing from a local file
   */
  const performImport = async (): Promise<Result<{ status: SyncStatus; payload?: SyncPayload }>> => {
    setLoading(true)
    setError(null)
    try {
      const res = await importBookmarks()
      if (!res.success) {
        setError(res.error || "导入失败")
        if (process.env.NODE_ENV === 'development')
          console.error("[hooks/useSync] In performImport, Import failed:", res.error)
      }
      return res
    } catch (e) {
      const msg = String(e)
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    performUpload,
    performDownload,
    performExport,
    performImport
  }
}
