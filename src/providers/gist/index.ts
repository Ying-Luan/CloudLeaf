/**
 * GitHub Gist provider module
 * @module providers/gist
 * @packageDocumentation
 */

import { type SyncPayload, type Result } from "~/src/types"
import { HttpProvider } from "~/src/providers"
import { GIST_ENDPOINTS } from "~/src/constants"

/**
 * GitHub Gist storage provider
 * @remarks Stores bookmarks as a file in a GitHub Gist
 */
export class GistProvider extends HttpProvider {
    // Provider unique identifier
    readonly id = "gist"
    // Provider display name
    readonly name = "GitHub Gist"

    // GitHub API base URL
    protected readonly baseUrl = GIST_ENDPOINTS.BASE_URL

    // GitHub personal access token
    private accessToken: string
    // Target Gist ID
    private gistId: string
    // Filename in the Gist
    private fileName: string

    /**
     * Create a new GistProvider instance
     * @param accessToken GitHub personal access token
     * @param gistId target Gist ID
     * @param fileName filename to store bookmarks
     */
    constructor(accessToken: string, gistId: string, fileName: string) {
        super()
        this.accessToken = accessToken
        this.gistId = gistId
        this.fileName = fileName
    }

    /**
     * Get base headers for GitHub API
     * @returns headers with GitHub API version
     */
    protected getBaseHeaders(): Record<string, string> {
        return {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    }

    /**
     * Get authentication headers
     * @returns empty object (auth passed per-request)
     */
    protected getAuthHeaders(): Record<string, string> {
        return {}
    }

    /**
     * Validate Gist configuration and access token
     * @returns whether configuration is valid
     */
    async isValid(): Promise<Result<boolean>> {
        try {
            // --- Validate Gist exists ---
            const gistResponse = await this.request("GET", `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`)

            if (!gistResponse.ok) {
                return { success: true, data: false, error: this.handleError(gistResponse).error }
            }

            // --- Validate access token ---
            const userResponse = await this.request("GET", GIST_ENDPOINTS.USER_PATH, {
                headers: { "Authorization": `Bearer ${this.accessToken}`, }
            })
            if (!userResponse.ok) {
                return { success: true, data: false, error: "Invalid token" }
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

    /**
     * Upload bookmarks to Gist
     * @param data bookmark payload
     * @returns success or error result
     */
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

    /**
     * Download bookmarks from Gist
     * @returns bookmark payload
     */
    async download(): Promise<Result<SyncPayload>> {
        try {
            const response = await this.request("GET", `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`)

            if (!response.ok) {
                return this.handleError(response)
            }

            const gistData = await response.json()
            const file = gistData.files[this.fileName]

            if (!file) {
                return { success: false, error: `File ${this.fileName} not found` }
            }

            const payload = JSON.parse(file.content) as SyncPayload
            return { success: true, data: payload }
        } catch (error) {
            return this.handleNetworkError(error)
        }
    }
}
