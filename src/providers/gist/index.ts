import { type SyncPayload, type Result } from "~/src/types"
import { HttpProvider } from "~/src/providers"
import { GIST_ENDPOINTS } from "~/src/constants"

/**
 * GitHub Gist 存储提供者
 */
export class GistProvider extends HttpProvider {
    readonly id = "gist"
    readonly name = "GitHub Gist"

    protected readonly baseUrl = GIST_ENDPOINTS.BASE_URL

    private accessToken: string
    private gistId: string
    private fileName: string

    constructor(accessToken: string, gistId: string, fileName: string) {
        super()
        this.accessToken = accessToken
        this.gistId = gistId
        this.fileName = fileName
    }

    protected getBaseHeaders(): Record<string, string> {
        return {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    }

    protected getAuthHeaders(): Record<string, string> {
        return {}
    }

    async isValid(): Promise<Result<boolean>> {
        try {
            // 验证 Gist 是否存在
            const gistResponse = await this.request("GET", `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`)

            if (!gistResponse.ok) {
                return { success: true, data: false, error: this.handleError(gistResponse).error }
            }

            // 验证 Token
            const userResponse = await this.request("GET", GIST_ENDPOINTS.USER_PATH, {
                headers: { "Authorization": `Bearer ${this.accessToken}`, }
            })
            if (!userResponse.ok) {
                return { success: true, data: false, error: "Token 无效" }
            }

            const gistData = await gistResponse.json()
            if (!gistData.files[this.fileName]) {
                return { success: true, data: true }
            }

            return { success: true, data: true }
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }

    async upload(data: SyncPayload): Promise<Result<void>> {
        try {
            const response = await this.request("PATCH", `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`, {
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                },
                body: {
                    files: {
                        [this.fileName]: {
                            content: JSON.stringify(data),
                        },
                    },
                },
            })

            if (!response.ok) {
                return this.handleError(response)
            }

            return { success: true }
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }

    async download(): Promise<Result<SyncPayload>> {
        try {
            const response = await this.request("GET", `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`)

            if (!response.ok) {
                return this.handleError(response)
            }

            const gistData = await response.json()
            const file = gistData.files[this.fileName]

            if (!file) {
                return { success: false, error: `文件 ${this.fileName} 不存在` }
            }

            const payload = JSON.parse(file.content) as SyncPayload
            return { success: true, data: payload }
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }
}
