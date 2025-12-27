import React from "react"


interface SwitchProps {
  label: string
  enabled: boolean
  onChange: (val: boolean) => void
}

export const Switch = ({ label, enabled, onChange }: SwitchProps) => {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!enabled)}>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
        {label}
      </span>

      {/* 开关主体 */}
      <div className={`
        relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
        ${enabled ? "bg-emerald-500" : "bg-slate-200"}
      `}>
        {/* 滑块小球 */}
        <div className={`
          absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `} />
      </div>
    </div>
  )
}
