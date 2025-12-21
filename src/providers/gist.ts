import { type SyncPayload, type ProviderResult } from "../types"
import { BaseProvider } from "./base"


/**
 * GitHub Gist 存储提供者
 */
export class GistProvider extends BaseProvider {
  readonly id = "gist"
  readonly name = "GitHub Gist"

  private readonly BASE_GIST_URL = "https://api.github.com/gists"
  private readonly BASE_USER_URL = "https://api.github.com/user"

  private accessToken: string
  private gistId: string
  private fileName: string

  private readonly BASE_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  private getAuthHearers() {
    return {
      ...this.BASE_HEADERS,
      "Authorization": `Bearer ${this.accessToken}`,
    }
  }

  constructor(accessToken: string, gistId: string, fileName: string = "CloudLeaf.json") {
    super()
    this.accessToken = accessToken
    this.gistId = gistId
    this.fileName = fileName
  }

  async isValid(): Promise<ProviderResult<boolean>> {
    try {
      // 验证 Gist 是否存在
      const responseGist = await fetch(`${this.BASE_GIST_URL}/${this.gistId}`, {
        method: "GET",
        headers: this.BASE_HEADERS,
      })

      if (!responseGist.ok || responseGist.status !== 200)
        return { success: true, data: false, error: `Unknown error: ${responseGist.status}` }

      const gistData = await responseGist.json()
      const file = gistData.files[this.fileName]
      if (!file)
        return { success: true, data: false, error: `File ${this.fileName} not found in Gist` }

      // 验证访问令牌是否有效
      const responseUser = await fetch(this.BASE_USER_URL, {
        method: "GET",
        headers: this.getAuthHearers(),
      })

      if (!responseUser.ok || responseUser.status !== 200)
        return { success: true, data: false, error: `Authentication failed: ${responseUser.status}` }

      return { success: true, data: true }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  async upload(data: SyncPayload): Promise<ProviderResult<void>> {
    try {
      const response = await fetch(`${this.BASE_GIST_URL}/${this.gistId}`, {
        method: "PATCH",
        headers: this.getAuthHearers(),
        body: JSON.stringify({
          "files": {
            [this.fileName]: {
              "content": JSON.stringify(data.bookmarks),
            },
          },
        }),
      })

      if (!response.ok || response.status !== 200)
        return { success: false, error: `Unknown error: ${response.status}` }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  async download(): Promise<ProviderResult<SyncPayload>> {
    try {
      const response = await fetch(`${this.BASE_GIST_URL}/${this.gistId}`, {
        method: "GET",
        headers: this.BASE_HEADERS,
      })

      if (!response.ok || response.status !== 200)
        return { success: false, error: `Unknown error: ${response.status}` }

      const gistData = await response.json()
      const file = gistData.files[this.fileName]
      if (!file)
        return { success: false, error: `File ${this.fileName} not found in Gist` }

      const content = file.content
      return { success: true, data: { "updatedAt": gistData.updated_at, "bookmarks": JSON.parse(content) } }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }
}
