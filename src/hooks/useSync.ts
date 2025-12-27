import { useState } from "react"
import { uploadBookmarks, downloadBookmarks } from "~src/core/sync"
import { type SyncStatus, type Result, type SyncPayload } from "~src/types"


export function useSync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return {
    loading,
    error,
    performUpload,
    performDownload,
  }
}
