import { WebDAVProvider } from "./webdav"
import { type WebDAVUserConfig, type CustomVendorConfig } from "~/src/types"

/**
 * WebDAV vendor registry (static singleton)
 * @remarks Manages preset and custom vendors, provides factory method
 */
export class WebDAVRegistry {
    // Preset vendors (read-only)
    private static readonly presetVendors: CustomVendorConfig[] = [
        {
            id: "jianguoyun",
            name: "坚果云",
            serverUrl: "https://dav.jianguoyun.com/dav",
        },
    ]

    // Custom vendors (dynamic)
    private static customVendors: CustomVendorConfig[] = []

    // Prevent instantiation
    private constructor() { }

    /**
     * Get all vendors (preset + custom)
     * @returns combined vendor list
     */
    public static getAllVendors(): CustomVendorConfig[] {
        return [...this.presetVendors, ...this.customVendors]
    }

    /**
     * Get vendor by ID
     * @param id vendor ID
     * @returns vendor config or undefined
     */
    public static getVendor(id: string): CustomVendorConfig | undefined {
        return this.getAllVendors().find(v => v.id === id)
    }

    /**
     * Add custom vendor
     * @param vendor vendor config to add
     * @remarks Use `addCustomVendorToConfig` from store/loader.ts instead
     */
    public static addCustomVendor(vendor: CustomVendorConfig): void {
        // --- Check if ID exists ---
        if (this.getVendor(vendor.id)) {
            throw new Error(`Vendor ID "${vendor.id}" already exists`)
        }
        this.customVendors.push(vendor)
    }

    /**
     * Remove custom vendor
     * @param id vendor ID to remove
     * @returns whether removal was successful
     * @remarks Use `removeCustomVendorFromConfig` from store/loader.ts instead
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
     * Clear all custom vendors
     */
    public static clearCustomVendors(): void {
        this.customVendors = []
    }

    /**
     * Get all custom vendors
     * @returns custom vendors array copy
     */
    public static getCustomVendors(): CustomVendorConfig[] {
        return [...this.customVendors]
    }

    /**
     * Get all preset vendors
     * @returns preset vendors array copy
     */
    public static getPresetVendors(): CustomVendorConfig[] {
        return [...this.presetVendors]
    }

    /**
     * Create WebDAV provider instance
     * @param vendorId vendor ID to use
     * @param config user configuration
     * @returns configured WebDAVProvider instance
     */
    public static createProvider(
        vendorId: string,
        config: WebDAVUserConfig
    ): WebDAVProvider {
        const vendor = this.getVendor(vendorId)

        if (!vendor) {
            throw new Error(`Unknown WebDAV vendor: ${vendorId}`)
        }

        const serverUrl = config.serverUrl || vendor.serverUrl
        if (!serverUrl) {
            throw new Error(`Vendor ${vendor.name} requires serverUrl`)
        }

        const filePath = config.filePath

        return new WebDAVProvider(
            vendor.id,
            vendor.name,
            serverUrl,
            config.username,
            config.password,
            filePath
        )
    }
}
