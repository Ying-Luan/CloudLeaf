/**
 * HTTP provider module
 * @module providers/http
 * @packageDocumentation
 */

import { type Result } from "~/src/types"
import { BaseProvider } from "~/src/providers"
import { HttpStatusMessage } from "~/src/constants"

/**
 * HTTP method types
 * - `GET` retrieve resource
 * - `PATCH` partial update
 * - `PROPFIND` WebDAV property retrieval
 * - `PUT` create or replace resource
 * - `MKCOL` WebDAV create collection
 */
type Method = "GET" | "PATCH" | "PROPFIND" | "PUT" | "MKCOL"

/**
 * Abstract HTTP protocol provider
 * @remarks Encapsulates common HTTP request logic
 */
export abstract class HttpProvider extends BaseProvider {
  // Base URL for the server
  protected abstract readonly baseUrl: string

  // Request timeout in ms
  protected readonly timeout = 30_000

  /**
   * Get authentication headers
   * @returns headers with auth credentials
   * @remarks Must be implemented by subclasses
   */
  protected abstract getAuthHeaders(): Record<string, string>

  /**
   * Get base request headers
   * @returns default headers
   */
  protected getBaseHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json; charset=utf-8",
    }
  }

  /**
   * Merge all request headers
   * @returns combined base and auth headers
   */
  protected getAllHeaders(): Record<string, string> {
    return {
      ...this.getBaseHeaders(),
      ...this.getAuthHeaders(),
    }
  }

  /**
   * Send HTTP request
   * @param method HTTP method
   * @param path request path
   * @param options optional config (body, headers)
   * @returns fetch response
   */
  protected async request(
    method: Method,
    path: string,
    options?: {
      body?: unknown
      headers?: Record<string, string>
    }
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.getAllHeaders(),
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: 'omit',
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Get HTTP error message by status code
   * @param status HTTP status code
   * @returns human-readable error message
   */
  protected getHttpErrorMessage(status: number): string {
    return HttpStatusMessage[status] || `Request failed: ${status}`
  }

  /**
   * Handle HTTP error response
   * @param response HTTP response object
   * @returns error result
   */
  protected handleError(response: Response): Result<never> {
    return { success: false, error: this.getHttpErrorMessage(response.status) }
  }

  /**
   * Handle network exceptions
   * @param error caught error object
   * @returns error result
   */
  protected handleNetworkError(error: unknown): Result<never> {
    if (error instanceof Error) {
      if (error.name === "AbortError") return { success: false, error: "Request timeout" }
      return { success: false, error: `Network error: ${error.message}` }
    }
    return { success: false, error: "Unknown network error" }
  }
}
