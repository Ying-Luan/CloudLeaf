import { type SyncPayload } from "~src/types"
import { type SyncStatus } from "~src/types"

/**
 * Compare local and remote payloads to determine the sync state
 * @param local Local payload containing update timestamp
 * @param remote Remote payload containing update timestamp
 * @returns the sync status: `'ahead'`, `'behind'`, or `'synced'`
 */
export function getSyncStatus(local: SyncPayload, remote: SyncPayload): SyncStatus {
  if (local.updatedAt > remote.updatedAt) return 'ahead'
  if (local.updatedAt < remote.updatedAt) return 'behind'
  return 'synced'
}
