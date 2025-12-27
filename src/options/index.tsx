import { useEffect, useState } from "react"
import { getUserConfig } from "~src/store"
import { GistSettings, Sources, WebDavSettings, WebDavVendorManager } from "~src/components"
import type { UserConfig } from "~src/types"
import "./index.css"


function OptionsPage() {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserConfig().then(data => {
      setConfig(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-20 text-slate-400">正在加载...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CloudLeaf 设置</h1>
        </header>

        <main className="space-y-6">
          <Sources
            config={config}
            onUpdate={setConfig}
          />

          <GistSettings
            config={config}
            onUpdate={setConfig}
          />

          <WebDavVendorManager
            config={config}
            onUpdate={setConfig}
          />

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
