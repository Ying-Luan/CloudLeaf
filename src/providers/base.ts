import { type SyncPayload, type ProviderResult } from '../types'

/**
 * 存储提供者基类
 */
export abstract class BaseProvider {
  abstract readonly id: string
  abstract readonly name: string

  /**
   * 验证配置是否有效
   * @returns 布尔值
   */
  abstract isValid(): Promise<ProviderResult<boolean>>
  /**
   * 上传书签到云端
   * @param data 书签数据
   */
  abstract upload(data: SyncPayload): Promise<ProviderResult<void>>
  /**
   * 从云端下载书签
   */
  abstract download(): Promise<ProviderResult<SyncPayload>>
}
