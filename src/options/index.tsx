import { useEffect, useState } from "react"
import { getUserConfig } from "~src/store"
import { GistSettings, Sources, WebDavSettings, WebDavVendorManager } from "~src/components"
import type { UserConfig } from "~src/types"
import "./index.css"

/**
 * Options page component for CloudLeaf extension.
 *
 * Provides the main settings interface where users can manage sync sources,
 * configure Gist and WebDAV accounts, and customize cloud vendor settings.
 * @returns A JSX element rendering the full options page
 */
function OptionsPage() {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user configuration on mount
    getUserConfig().then(data => {
      setConfig(data)
      setLoading(false)
    })
  }, [])

  // Loading state UI
  if (loading) return <div className="p-20 text-slate-400">正在加载...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CloudLeaf 设置</h1>
        </header>

        {/* Main content sections */}
        <main className="space-y-6">
          {/* Sync sources management */}
          <Sources
            config={config}
            onUpdate={setConfig}
          />

          {/* Gist configuration section */}
          <GistSettings
            config={config}
            onUpdate={setConfig}
          />

          {/* WebDAV vendor management section */}
          <WebDavVendorManager
            config={config}
            onUpdate={setConfig}
          />

          {/* WebDAV account configuration section */}
          <WebDavSettings
            config={config}
            onUpdate={setConfig}
          />
        </main>
      </div>
    </div>
  )
}

export default OptionsPage
