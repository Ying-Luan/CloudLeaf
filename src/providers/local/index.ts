/**
 * Local browser provider module
 * @module providers/local
 * @packageDocumentation
 */

import { type SyncPayload, type Result } from "~/src/types"
import { BaseProvider } from "~/src/providers"
import { getBookmarks, setBookmarks } from "~/src/core/bookmark"

/**
 * Local browser bookmark provider
 * @remarks Wraps browser bookmark API as a unified provider interface
 */
export class LocalProvider extends BaseProvider {
    // Provider unique identifier
    readonly id = "local"
    // Provider display name
    readonly name = "Local Browser"

    /**
     * Validate local provider (always valid)
     * @returns Always true since local storage is always available
     */
    async isValid(): Promise<Result<boolean>> {
        return { success: true, data: true }
    }

    /**
     * Upload bookmarks to browser (save to local)
     * @param data Bookmark payload to save
     * @returns Success or error result
     */
    async upload(data: SyncPayload): Promise<Result<void>> {
        try {
            await setBookmarks(data)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to save bookmarks"
            }
        }
    }

    /**
     * Download bookmarks from browser (read from local)
     * @returns Current browser bookmarks as SyncPayload
     */
    async download(): Promise<Result<SyncPayload>> {
        try {
            const payload = await getBookmarks()
            return { success: true, data: payload }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to read bookmarks"
            }
        }
    }
}
