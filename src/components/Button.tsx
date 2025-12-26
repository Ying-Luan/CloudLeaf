import React from "react"
import "./index.css"

interface ButtonProps {
  label: string
  onClick: () => void | Promise<void>
  loading?: boolean
  disabled?: boolean
  className?: string
}

const Button = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  className = ""
}: ButtonProps) => {
  const baseStyles = "w-full py-2 bg-white text-slate-700 border border-slate-200 rounded-lg transition-all flex items-center justify-center gap-2 font-mono text-sm font-medium tracking-tight"
  const stateStyles = (disabled || loading)
    ? "opacity-50 cursor-not-allowed"
    : "hover:bg-slate-50 active:scale-95 cursor-pointer"

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${stateStyles} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  )
}

export default Button
