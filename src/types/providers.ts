import { type BookMark } from "."


/**
 * 同步数据的负载接口
 */
export interface SyncPayload {
  updatedAt: number
  bookmarks: BookMark[]
}

/**
 * 存储提供者结果接口
 */
export interface ProviderResult<T> {
  success: boolean
  data?: T
  error?: string
}
