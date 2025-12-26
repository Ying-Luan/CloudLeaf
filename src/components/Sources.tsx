import React, { useState } from "react"
import { GistProvider, WebDAVRegistry } from "~src/providers"
import type { UserConfig } from "~src/types"


interface SourcesProps {
  config: UserConfig | null
  onUpdate: (newConfig: UserConfig) => void
}

interface SourceItem {
  type: "gist" | "webdav"
  id: string
  label: string
  rawIndex?: number
}

const Sources = ({ config, onUpdate }: SourcesProps) => {
  // 记录每个源的加载状态，key 可以是 'gist' 或 'webdav-index'
  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({})
  const hasGist = !!config?.gist?.accessToken
  const webDavCount = config?.webDavConfigs?.length || 0
  const hasSources = hasGist || webDavCount > 0
  const allSources: SourceItem[] = [
    ...(hasGist ? [{
      type: "gist" as const,
      id: "gist",
      label: config!.gist!.fileName || "Gist",
    }] : []),
    ...(config?.webDavConfigs?.map((acc, idx) => ({
      type: "webdav" as const,
      id: `webdav-${idx}`,
      label: `${acc.vendorId} / ${acc.username} ${acc.filePath}`,
      rawIndex: idx
    })) || [])
  ]

  // 设置特定源的测试状态
  const setItemTesting = (id: string, isTesting: boolean) => {
    setTestingMap(prev => ({ ...prev, [id]: isTesting }))
  }

  // === 测试 Gist ===
  const testGist = async () => {
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

  // === 测试 WebDAV ===
  const testWebDav = async (index: number) => {
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

  const removeGist = () => {
    if (!confirm("确定移除 GitHub Gist 配置吗？")) return
    onUpdate({ ...config!, gist: undefined })
  }

  const removeWebDav = (index: number) => {
    if (!confirm("确定移除该 WebDAV 账号吗？")) return
    const newConfigs = [...(config?.webDavConfigs || [])]
    newConfigs.splice(index, 1)
    onUpdate({ ...config!, webDavConfigs: newConfigs })
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-mono tracking-tight">已启用的同步源</h3>
      </div>

      {!hasSources ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 text-sm font-mono">暂未配置任何同步源</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {allSources.map((source) => {
            // 动态计算样式配置
            const isGist = source.type === "gist"
            const isTesting = testingMap[source.id]

            const themes = {
              gist: "bg-slate-900 text-white shadow-lg shadow-slate-200",
              webdav: "bg-blue-50 border border-blue-100 text-blue-900"
            }

            const badgeThemes = {
              gist: "bg-white/20",
              webdav: "bg-blue-600 text-white"
            }

            return (
              <div
                key={source.id}
                className={`flex items-center justify-between p-3 rounded-lg group transition-all ${themes[source.type]}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${badgeThemes[source.type]}`}>
                    {source.type}
                  </span>
                  <span className="font-mono text-sm truncate max-w-100">
                    {source.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                    <button
                      onClick={() => isGist ? testGist() : testWebDav(source.rawIndex!)}
                      disabled={isTesting}
                      className={`text-[10px] px-2 py-1 rounded cursor-pointer font-mono disabled:opacity-50 ${isGist ? "bg-white/10 hover:bg-white/30" : "bg-blue-200/50 hover:bg-blue-600 hover:text-white"
                        }`}
                    >
                      {isTesting ? "..." : "测试"}
                    </button>
                    <button
                      onClick={() => isGist ? removeGist() : removeWebDav(source.rawIndex!)}
                      className={`text-[10px] px-2 py-1 rounded cursor-pointer font-mono ${isGist ? "bg-red-500/20 hover:bg-red-500 text-red-100" : "text-red-400 hover:text-red-600"
                        }`}
                    >
                      移除
                    </button>
                  </div>

                  <div className={`w-2 h-2 rounded-full ${isGist ? "bg-green-400 animate-pulse" : "bg-blue-400"
                    }`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Sources
