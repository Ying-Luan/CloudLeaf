import { WebDAVRegistry } from "~/src/providers"
import type { UserConfig, CustomVendorConfig } from "~/src/types"

/**
 * 从 UserConfig 加载自定义云厂商到注册表
 * 应在应用启动时调用 ？ 使用时即调入
 */
export function loadCustomVendorsFromConfig(config: UserConfig): void {
    if (!config.customVendors || config.customVendors.length === 0) {
        return
    }

    WebDAVRegistry.clearCustomVendors()

    for (const vendor of config.customVendors) {
        try {
            WebDAVRegistry.addCustomVendor({
                id: vendor.id,
                name: vendor.name,
                serverUrl: vendor.serverUrl,
            })
        } catch (error) {
            // 跳过已存在的云厂商
            console.warn(`加载云厂商 ${vendor.id} 失败:`, error)
        }
    }
}

/**
 * 添加自定义云厂商并同步到 UserConfig
 * @returns 更新后的 customVendors 列表
 */
export function addCustomVendorToConfig(
    currentConfig: UserConfig,
    vendor: CustomVendorConfig
): CustomVendorConfig[] {
    // 添加到注册表
    WebDAVRegistry.addCustomVendor({
        id: vendor.id,
        name: vendor.name,
        serverUrl: vendor.serverUrl,
    })

    // 更新配置
    const customVendors = currentConfig.customVendors || []
    return [...customVendors, vendor]
}

/**
 * 删除自定义云厂商并同步到 UserConfig
 * @returns 更新后的 customVendors 列表
 */
export function removeCustomVendorFromConfig(
    currentConfig: UserConfig,
    vendorId: string
): CustomVendorConfig[] {
    // 从注册表删除
    WebDAVRegistry.removeCustomVendor(vendorId)

    // 更新配置
    const customVendors = currentConfig.customVendors || []
    return customVendors.filter(v => v.id !== vendorId)
}
