import { type SyncPayload, type ProviderResult } from "~/src/types"
import { HttpProvider } from "~/src/providers"
import { HttpStatus } from "~/src/constants"
import { WebDAVStatus, WebDAVStatusMessage } from "~/src/constants"

/**
 * L3: WebDAV 协议提供者抽象类
 * 继承 HttpProvider，扩展 WebDAV 特有功能
 */
export abstract class WebDAVProvider extends HttpProvider {
    protected serverUrl: string
    protected username: string
    protected password: string
    protected filePath: string

    protected get baseUrl(): string {
        return this.serverUrl
    }

    constructor(
        serverUrl: string,
        username: string,
        password: string,
        filePath: string
    ) {
        super()
        this.serverUrl = this.normalizeUrl(serverUrl)
        this.username = username
        this.password = password
        this.filePath = this.normalizePath(filePath)
    }

    async isValid(): Promise<ProviderResult<boolean>> {
        try {
            const response = await this.request("PROPFIND", this.filePath, {
                headers: { "Depth": "0" },
            })

            const { status } = response

            if (status === WebDAVStatus.MULTI_STATUS) {
                return { success: true, data: true }
            }

            if (status === HttpStatus.NOT_FOUND || status === WebDAVStatus.CONFLICT) {
                return { success: true, data: true }
            }

            if (status === HttpStatus.UNAUTHORIZED) {
                return { success: true, data: false, error: this.getErrorMessage(status) }
            }

            return { success: true, data: false, error: this.getErrorMessage(status) }
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }

    async upload(data: SyncPayload): Promise<ProviderResult<void>> {
        try {
            await this.ensureDirectory()

            const response = await this.request("PUT", this.filePath, {
                body: data,
                headers: { "Content-Type": "application/json; charset=utf-8" },
            })

            if (this.isSuccess(response.status)) {
                return { success: true }
            }

            return this.handleWebDAVError(response.status)
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }

    async download(): Promise<ProviderResult<SyncPayload>> {
        try {
            const response = await this.request("GET", this.filePath)

            const { status } = response

            if (status === HttpStatus.NOT_FOUND) {
                return { success: false, error: "文件不存在：请先上传书签" }
            }

            if (!this.isSuccess(status)) {
                return this.handleWebDAVError(status)
            }

            const content = await response.text()

            try {
                const data = JSON.parse(content) as SyncPayload
                if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                    return { success: false, error: "文件格式错误：缺少 bookmarks 字段" }
                }
                return { success: true, data }
            } catch {
                return { success: false, error: "文件格式错误：无法解析 JSON" }
            }
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }

    /**
     * 标准化 URL（移除末尾斜杠）
     */
    private normalizeUrl(url: string): string {
        return url.endsWith("/") ? url.slice(0, -1) : url
    }

    /**
     * 标准化路径（确保以 / 开头）
     */
    private normalizePath(path: string): string {
        return path.startsWith("/") ? path : `/${path}`
    }

    /**
     * 获取父目录路径
     */
    protected getParentPath(): string {
        const lastSlash = this.filePath.lastIndexOf("/")
        return lastSlash > 0 ? this.filePath.substring(0, lastSlash) : "/"
    }

    /**
     * 获取认证头（Basic Auth）
     */
    protected getAuthHeaders(): Record<string, string> {
        const credentials = btoa(`${this.username}:${this.password}`)
        return {
            "Authorization": `Basic ${credentials}`,
        }
    }

    /**
     * 重写基础请求头（WebDAV 不需要默认的 Content-Type）
     */
    protected getBaseHeaders(): Record<string, string> {
        return {}
    }

    /**
     * 获取错误消息（优先使用 WebDAV 消息，回退到 HTTP 消息）
     */
    protected getErrorMessage(status: number): string {
        return WebDAVStatusMessage[status] || this.getHttpErrorMessage(status)
    }

    /**
     * 判断是否为成功状态码
     */
    protected isSuccess(status: number): boolean {
        return status >= 200 && status < 300
    }

    /**
     * WebDAV 错误处理
     */
    protected handleWebDAVError(status: number): ProviderResult<never> {
        return { success: false, error: this.getErrorMessage(status) }
    }

    /**
     * 确保父目录存在
     */
    protected async ensureDirectory(): Promise<void> {
        const parentPath = this.getParentPath()
        if (parentPath === "/") return

        try {
            await this.request("MKCOL", parentPath)
        } catch {
            // 忽略错误，让后续操作处理
        }
    }
}
