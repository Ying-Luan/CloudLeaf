import { type Result } from "~/src/types"
import { BaseProvider } from "~/src/providers"
import { HttpStatusMessage } from "~/src/constants"

type Method = "GET" | "PATCH" | "PROPFIND" | "PUT" | "MKCOL"

/**
 * L2: HTTP 协议提供者抽象类
 * 封装 HTTP 请求通用逻辑
 */
export abstract class HttpProvider extends BaseProvider {
  /** 服务器基础 URL */
  protected abstract readonly baseUrl: string
  protected readonly timeout = 30_000

  /**
   * 获取认证请求头（子类实现）
   */
  protected abstract getAuthHeaders(): Record<string, string>

  /**
   * 获取基础请求头
   */
  protected getBaseHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json; charset=utf-8",
    }
  }

  /**
   * 合并所有请求头
   */
  protected getAllHeaders(): Record<string, string> {
    return {
      ...this.getBaseHeaders(),
      ...this.getAuthHeaders(),
    }
  }

  /**
   * 发起 HTTP 请求
   * @param method HTTP 方法
   * @param path 请求路径
   * @param options 可选配置：body 数据、自定义 headers
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
        credentials: 'omit', // 禁止浏览器弹出认证窗口
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * 获取 HTTP 错误消息
   * @param status HTTP 状态码
   */
  protected getHttpErrorMessage(status: number): string {
    return HttpStatusMessage[status] || `请求失败: ${status}`
  }

  /**
   * 统一错误处理
   * @param response HTTP 响应对象
   */
  protected handleError(response: Response): Result<never> {
    return { success: false, error: this.getHttpErrorMessage(response.status) }
  }

  /**
   * 网络异常处理
   */
  protected handleNetworkError(error: unknown): Result<never> {
    if (error instanceof Error) {
      if (error.name === "AbortError") return { success: false, error: "请求超时" }
      return { success: false, error: `网络错误: ${error.message}` }
    }
    return { success: false, error: "未知网络错误" }
  }
}
