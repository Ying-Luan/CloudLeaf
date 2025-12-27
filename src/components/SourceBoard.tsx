import { type SourceItem } from "~src/types"
import { useState } from "react"


interface SourceBoardProps {
  source: SourceItem
  testGist: () => Promise<void>
  testWebDav: (index: number) => Promise<void>
  removeGist: () => void
  removeWebDav: (index: number) => void
  isTesting: boolean
  saving: boolean
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  index: number
  total: number
}

/**
 * 显示单个源的信息卡片
 */
const SourceBoard = ({ source, testGist, testWebDav, removeGist, removeWebDav, isTesting, saving, onMoveUp, onMoveDown, index, total }: SourceBoardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isGist = source.type === "gist"

  const btnBase = "text-[10px] px-1.5 py-1 rounded cursor-pointer font-mono transition-all disabled:opacity-20 disabled:cursor-not-allowed"
  const moveBtnTheme = isGist
    ? "bg-white/10 hover:bg-white/30 text-white"
    : "bg-slate-200/50 hover:bg-slate-300 text-slate-600"

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
      className={`flex flex-col rounded-lg overflow-hidden group transition-all font-mono font-bold ${themes[source.type]}`}
    >
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between p-3 w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 -ml-1 transition-transform duration-300 cursor-pointer ${isExpanded ? "rotate-180" : ""}`}
          >
            <svg className="w-4 h-4 opacity-40 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold shrink-0 ${badgeThemes[source.type]}`}>
            {source.type}
          </span>

          {!isExpanded && (
            <span className="font-mono text-sm truncate opacity-80 animate-in fade-in slide-in-from-left-2 duration-300 max-w-50">
              {source.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-black/5 rounded p-0.5 gap-1">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className={`${btnBase} ${moveBtnTheme} px-2`}
            >
              ▲
            </button>
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === total - 1}
              className={`${btnBase} ${moveBtnTheme} px-2`}
            >
              ▼
            </button>
          </div>

          <div className={`w-2.5 h-2.5 rounded-full ${isGist ? "bg-green-400 animate-pulse" : "bg-blue-400"}`} />
        </div>
      </div>

      {/* 面板展开内容 */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className={`p-4 border-t space-y-4 ${isGist ? "border-white/10 bg-white/5" : "border-blue-100 bg-blue-100/30"}`}>

            {/* 文件名展示区域 */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-40 uppercase tracking-wider">Storage Location / File Name</span>
              <span className="text-sm break-all font-mono">{source.label}</span>
            </div>

            {/* 操作按钮区域 */}
            <div className="flex gap-2 pt-2 border-t border-black/5">
              <button
                onClick={() => isGist ? testGist() : testWebDav(source.rawIndex!)}
                disabled={isTesting}
                className={`flex-1 py-2 rounded-md text-[11px] transition-all cursor-pointer font-bold ${isGist ? "bg-white/10 hover:bg-white/20 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {isTesting ? "正在连接..." : "验证连接状态"}
              </button>

              <button
                onClick={() => isGist ? removeGist() : removeWebDav(source.rawIndex!)}
                disabled={saving}
                className={`px-4 py-2 rounded-md text-[11px] transition-all cursor-pointer font-bold ${isGist ? "bg-red-500/20 hover:bg-red-500 text-white" : "text-red-500 hover:bg-red-50 hover:text-red-600"
                  }`}
              >
                移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourceBoard
