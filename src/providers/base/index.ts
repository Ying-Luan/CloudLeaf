import { type SyncPayload, type ProviderResult } from "~/src/types"

/**
 * L1: 存储提供者基类
 * 定义所有 Provider 必须实现的接口契约
 */
export abstract class BaseProvider {
    /** 唯一标识符 */
    abstract readonly id: string

    /** 显示名称 */
    abstract readonly name: string

    /**
     * 验证配置是否有效
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
