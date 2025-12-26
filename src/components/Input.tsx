import React from "react"

interface InputProps {
  label: string
  value: string
  onChange: (val: string) => void
  type?: "text" | "password"
  placeholder?: string
  className?: string
}

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = ""
}: InputProps) => {
  return (
    <div className={`group flex flex-col gap-1 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-mono text-sm placeholder:text-slate-300"
      />
    </div>
  )
}

export default Input
