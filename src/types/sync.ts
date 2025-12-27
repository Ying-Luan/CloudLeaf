import { type BookMark } from "."


/**
 * 同步数据的负载接口
 */
export interface SyncPayload {
  updatedAt: number
  numBookmarks: number
  bookmarks: BookMark[]
}

export type SyncStatus =
  | 'ahead'      // 本地较新
  | 'behind'     // 云端较新
  | 'synced'     // 两端一致
  | 'none'       // 无数据
