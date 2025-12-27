import React, { useState } from "react"
import { type UserConfig } from "~src/types"
import { type SourceItem } from "~src/types"
import SourceBoard from "./SourceBoard"
import { useSaveConfig, useTest } from "~src/hooks"
import { on } from "events"


interface SourcesProps {
  config: UserConfig | null
  onUpdate: (newConfig: UserConfig) => void
}

const Sources = ({ config, onUpdate }: SourcesProps) => {
  // 记录每个源的加载状态，key 可以是 'gist' 或 'webdav-index'
  const { saving, saveConfig } = useSaveConfig()
  const { testingMap, testGist, testWebDav } = useTest()
  const hasGist = !!config?.gist?.accessToken
  const webDavCount = config?.webDavConfigs?.length || 0
  const hasSources = hasGist || webDavCount > 0
  const allSources: SourceItem[] = [
    ...(hasGist ? [{
      type: "gist" as const,
      id: "gist",
      label: config!.gist!.fileName,
      priority: config!.gist!.priority
    }] : []),
    ...(config?.webDavConfigs?.map((acc, idx) => ({
      type: "webdav" as const,
      id: `webdav-${idx}`,
      label: `${acc.vendorId} / ${acc.username} ${acc.filePath}`,
      priority: acc.priority,
      rawIndex: idx
    })) || [])
  ]

  const removeGist = () => {
    if (!confirm("确定移除 GitHub Gist 配置吗？")) return
    const newConfig = { ...config!, gist: undefined }
    onUpdate(newConfig)
    saveConfig(newConfig)
  }

  const removeWebDav = (index: number) => {
    if (!confirm("确定移除该 WebDAV 账号吗？")) return
    const newConfigs = [...(config?.webDavConfigs || [])]
    newConfigs.splice(index, 1)
    const newConfig = { ...config!, webDavConfigs: newConfigs }
    onUpdate(newConfig)
    saveConfig(newConfig)
  }

  const updateSourcePriority = (oldConfig: UserConfig, source: SourceItem, newPriority: number): UserConfig => {
    if (source.type === "gist") {
      return {
        ...oldConfig,
        gist: {
          ...oldConfig.gist,
          priority: newPriority
        }
      }
    } else {
      return {
        ...oldConfig,
        webDavConfigs: oldConfig.webDavConfigs!.map((acc, idx) =>
          idx === source.rawIndex ? { ...acc, priority: newPriority } : acc
        )
      }
    }
  }

  const onMoveUp = (index: number) => {
    const source = allSources[index]
    const targetSource = allSources[index - 1]
    const targetPriority = targetSource.priority
    let newConfig = updateSourcePriority(config, source, targetPriority)
    newConfig = updateSourcePriority(newConfig, targetSource, targetPriority + 1)
    onUpdate(newConfig)
    saveConfig(newConfig, true)
  }

  const onMoveDown = (index: number) => {
    const source = allSources[index]
    const targetSource = allSources[index + 1]
    const targetPriority = targetSource.priority
    let newConfig = updateSourcePriority(config, source, targetPriority)
    newConfig = updateSourcePriority(newConfig, targetSource, targetPriority - 1)
    onUpdate(newConfig)
    saveConfig(newConfig, true)
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
          {allSources.sort((a, b) => a.priority - b.priority).map((source, i) => {
            const isTesting = testingMap[source.id]
            return (
              <SourceBoard
                source={source}
                testGist={() => testGist(config)}
                testWebDav={(index) => testWebDav(config, index)}
                removeGist={removeGist}
                removeWebDav={removeWebDav}
                isTesting={isTesting}
                saving={saving}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                index={i}
                total={allSources.length}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Sources
