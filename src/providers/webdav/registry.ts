import { WebDAVProvider } from "./webdav"
import { type WebDAVUserConfig, type CustomVendorConfig } from "~/src/types"

/**
 * 具体 WebDAV Provider 实现类
 */
class ConcreteWebDAVProvider extends WebDAVProvider {
    readonly id: string
    readonly name: string

    constructor(
        id: string,
        name: string,
        serverUrl: string,
        username: string,
        password: string,
        filePath: string
    ) {
        super(serverUrl, username, password, filePath)
        this.id = id
        this.name = name
    }
}

/**
 * WebDAV 服务商注册表（静态单例）
 */
export class WebDAVRegistry {
    /** 预置服务商（不可修改） */
    private static readonly presetVendors: CustomVendorConfig[] = [
        {
            id: "jianguoyun",
            name: "坚果云",
            serverUrl: "https://dav.jianguoyun.com/dav",
        },
    ]

    /** 自定义服务商（可动态添加/删除） */
    private static customVendors: CustomVendorConfig[] = []

    // 禁止实例化
    private constructor() { }

    /**
     * 获取所有服务商（预置 + 自定义）
     */
    public static getAllVendors(): CustomVendorConfig[] {
        return [...this.presetVendors, ...this.customVendors]
    }

    /**
     * 根据 ID 获取服务商
     */
    public static getVendor(id: string): CustomVendorConfig | undefined {
        return this.getAllVendors().find(v => v.id === id)
    }

    /**
     * 添加自定义服务商
     */
    public static addCustomVendor(vendor: CustomVendorConfig): void {
        // 检查 ID 是否已存在
        if (this.getVendor(vendor.id)) {
            throw new Error(`服务商 ID "${vendor.id}" 已存在`)
        }
        this.customVendors.push(vendor)
    }

    /**
     * 删除自定义服务商
     */
    public static removeCustomVendor(id: string): boolean {
        const index = this.customVendors.findIndex(v => v.id === id)
        if (index === -1) {
            return false
        }
        this.customVendors.splice(index, 1)
        return true
    }

    /**
     * 获取所有自定义服务商
     */
    public static getCustomVendors(): CustomVendorConfig[] {
        return [...this.customVendors]
    }

    /**
     * 获取所有预置服务商
     */
    public static getPresetVendors(): CustomVendorConfig[] {
        return [...this.presetVendors]
    }

    /**
     * 创建 WebDAV Provider 实例
     */
    public static createProvider(
        vendorId: string,
        config: WebDAVUserConfig
    ): WebDAVProvider {
        const vendor = this.getVendor(vendorId)

        if (!vendor) {
            throw new Error(`未知的 WebDAV 服务商: ${vendorId}`)
        }

        const serverUrl = config.serverUrl || vendor.serverUrl
        if (!serverUrl) {
            throw new Error(`服务商 ${vendor.name} 需要提供 serverUrl`)
        }

        // filePath 从用户配置中获取（必填）
        const filePath = config.filePath

        return new ConcreteWebDAVProvider(
            vendor.id,
            vendor.name,
            serverUrl,
            config.username,
            config.password,
            filePath
        )
    }
}
