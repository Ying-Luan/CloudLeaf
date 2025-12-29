import React, { useState } from "react"
import { type UserConfig, type SourceItem, type Editor } from "~src/types"
import SourceBoard from "./SourceBoard"
import { useSaveConfig, useTest } from "~src/hooks"

/**
 * Props for the `Sources` component.
 *
 * Represents the current user configuration and an update callback.
 */
interface SourcesProps {
  /**
   * Current user configuration or `null` when not configured
   */
  config: UserConfig | null
  /**
   * Callback to apply an updated configuration
   */
  onUpdate: (newConfig: UserConfig) => void
  /**
   * Open editor panel below for add/edit
   */
  onOpenEditor: (opts: Editor) => void
}

/**
 * Component that lists configured sync sources and actions for each.
 *
 * Renders Gist and WebDAV entries, and provides controls to test, remove,
 * reorder and toggle each source.
 * @param props Sources component properties
 * @returns A JSX element rendering the sources list
 */
const Sources = ({ config, onUpdate, onOpenEditor }: SourcesProps) => {
  // Hook state and helpers for saving and testing providers
  const { saving, saveConfig } = useSaveConfig()
  const { testingMap, testGist, testWebDav } = useTest()
  const [showAddChooser, setShowAddChooser] = useState(false)

  // Determine if any sources are configured
  const hasGist = !!config?.gist?.accessToken
  const webDavCount = config?.webDavConfigs?.length || 0
  const hasSources = hasGist || webDavCount > 0

  /**
   * All configured sources as `SourceItem` array.
   */
  const allSources: SourceItem[] = [
    ...(hasGist ? [{
      type: "gist" as const,
      id: "gist",
      label: config!.gist!.fileName,
      priority: config!.gist!.priority,
      enabled: config!.gist!.enabled,
    }] : []),
    ...(config?.webDavConfigs?.map((acc, idx) => ({
      type: "webdav" as const,
      id: `webdav-${idx}`,
      label: `${acc.vendorId} / ${acc.username} ${acc.filePath}`,
      priority: acc.priority,
      rawIndex: idx,
      enabled: acc.enabled,
    })) || [])
  ]

  /**
   * Remove Gist configuration after user confirmation.
   */
  const removeGist = () => {
    if (!confirm("确定移除 GitHub Gist 配置吗？")) return
    const newConfig = { ...config!, gist: undefined }
    onUpdate(newConfig)
    saveConfig(newConfig)
  }

  /**
   * Remove a WebDAV account configuration by index after confirmation.
   * @param index Index of the WebDAV account to remove
   */
  const removeWebDav = (index: number) => {
    if (!confirm("确定移除该 WebDAV 账号吗？")) return
    const newConfigs = [...(config?.webDavConfigs || [])]
    newConfigs.splice(index, 1)
    const newConfig = { ...config!, webDavConfigs: newConfigs }
    onUpdate(newConfig)
    saveConfig(newConfig)
  }

  /**
   * Update priority for a given source within the provided config.
   * @param oldConfig Existing user configuration
   * @param source Source item to update
   * @param newPriority New priority value to set
   * @returns Updated user configuration with modified source priority
   */
  const updateSourcePriority = (oldConfig: UserConfig, source: SourceItem, newPriority: number): UserConfig => {
    // gist
    if (source.type === "gist") {
      return {
        ...oldConfig,
        gist: {
          ...oldConfig.gist,
          priority: newPriority
        }
      }
      // webdav
    } else {
      return {
        ...oldConfig,
        webDavConfigs: oldConfig.webDavConfigs!.map((acc, idx) =>
          idx === source.rawIndex ? { ...acc, priority: newPriority } : acc
        )
      }
    }
  }

  /**
   * Move the source at `index` one position up by changing priorities
   * @param index Index of the source to move up
   */
  const onMoveUp = (index: number) => {
    const source = allSources[index]
    const targetSource = allSources[index - 1]
    const targetPriority = targetSource.priority
    let newConfig = updateSourcePriority(config, source, targetPriority)
    newConfig = updateSourcePriority(newConfig, targetSource, targetPriority + 1)
    onUpdate(newConfig)
    saveConfig(newConfig, true)
  }

  /**
   * Move the source at `index` one position down by changing priorities.
   * @param index Index of the source to move down
   */
  const onMoveDown = (index: number) => {
    const source = allSources[index]
    const targetSource = allSources[index + 1]
    const targetPriority = targetSource.priority
    let newConfig = updateSourcePriority(config, source, targetPriority)
    newConfig = updateSourcePriority(newConfig, targetSource, targetPriority - 1)
    onUpdate(newConfig)
    saveConfig(newConfig, true)
  }

  /**
   * Toggle enabled state for the given source and persist the change.
   * @param source Source item to update
   * @param enabled New enabled state
   */
  const onUpdateEnabled = (source: SourceItem, enabled: boolean) => {
    let newConfig: UserConfig
    // gist
    if (source.type === "gist") {
      newConfig = {
        ...config,
        gist: {
          ...config.gist,
          enabled
        }
      }
      // webdav
    } else {
      newConfig = {
        ...config,
        webDavConfigs: config.webDavConfigs!.map((acc, idx) =>
          idx === source.rawIndex ? { ...acc, enabled } : acc
        )
      }
    }
    onUpdate(newConfig)
    saveConfig(newConfig, true)
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2">
        {/* Icon container */}
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 font-mono tracking-tight">已启用的同步源</h3>
      </div>

      {/* Content */}
      {!hasSources ? (
        /* Empty state */
        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 text-sm font-mono">暂未配置任何同步源</p>
        </div>
        /* Not empty state */
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
                onUpdateEnabled={(enabled) => onUpdateEnabled(source, enabled)}
                onEdit={() => onOpenEditor({ mode: "edit", type: source.type, index: source.rawIndex })}
              />
            )
          })}
        </div>
      )}

      {/* Add new source area */}
      <div className="pt-2">
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-2 text-[12px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
            onClick={() => setShowAddChooser(v => !v)}
          >
            新增同步源
          </button>

          {showAddChooser && (
            <div className="flex items-center gap-2">
              <button
                className={`px-2 py-1 text-[12px] rounded-md border font-mono ${hasGist ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-900 hover:text-white border-slate-200"}`}
                disabled={hasGist}
                onClick={() => {
                  onOpenEditor({ mode: "add", type: "gist" })
                  setShowAddChooser(false)
                }}
              >
                Gist
              </button>
              <button
                className="px-2 py-1 text-[12px] rounded-md border font-mono hover:bg-slate-900 hover:text-white border-slate-200"
                onClick={() => {
                  onOpenEditor({ mode: "add", type: "webdav" })
                  setShowAddChooser(false)
                }}
              >
                WebDAV
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Sources
