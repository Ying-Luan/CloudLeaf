import { useState } from "react"
import { GistProvider, WebDAVRegistry } from "~src/providers"
import { type UserConfig } from "~src/types"


/**
 * Hook 用于测试同步源的连接状态
 */
export const useTest = () => {
  // 记录每个源的加载状态，key 可以是 'gist' 或 'webdav-index'
  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({})

  // 设置特定源的测试状态
  const setItemTesting = (id: string, isTesting: boolean) => {
    setTestingMap(prev => ({ ...prev, [id]: isTesting }))
  }

  const testGist = async (config: UserConfig) => {
    if (!config?.gist) return
    const id = "gist"
    setItemTesting(id, true)
    try {
      const provider = new GistProvider(
        config.gist.accessToken,
        config.gist.gistId,
        config.gist.fileName
      )
      const res = await provider.isValid()
      alert(res.success ? "Gist 连接正常" : `Gist 连接失败: ${res.error}`)
    } catch (e) {
      alert(`发生异常: ${e}`)
    } finally {
      setItemTesting(id, false)
    }
  }

  const testWebDav = async (config: UserConfig, index: number) => {
    const acc = config?.webDavConfigs?.[index]
    if (!acc) return
    const id = `webdav-${index}`
    setItemTesting(id, true)
    try {
      const provider = WebDAVRegistry.createProvider(acc.vendorId, acc)
      const res = await provider.isValid()
      alert(res.success ? `WebDAV [${acc.username}] 连接正常` : `WebDAV 连接失败: ${res.error}`)
    } catch (e) {
      alert(`发生异常: ${e}`)
    } finally {
      setItemTesting(id, false)
    }
  }

  return { testingMap, testGist, testWebDav }
}
