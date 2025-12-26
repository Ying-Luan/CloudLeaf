import { useEffect, useState } from "react"
import { getUserConfig, updateUserConfig } from "~src/store"
import GistSettings from "~src/components/GistSettings"
import WebDavSettings from "~src/components/WebDavSettings"
import Button from "~src/components/Button"
import type { UserConfig } from "~src/types"
import "./index.css"
import WebDavVendorManager from "~src/components/WebDavVendorManager"
import Sources from "~src/components/Sources"


function OptionsPage() {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUserConfig().then(data => {
      setConfig(data)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    await updateUserConfig(config)
    setSaving(false)
    alert("设置已保存")
  }

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
            onUpdate={(newConfig) => setConfig(newConfig)}
          />

          <GistSettings
            config={config?.gist}
            onUpdate={(gist) => setConfig({ ...config!, gist })}
          />

          <WebDavVendorManager
            config={config}
            onUpdate={(newConfig) => setConfig(newConfig)}
          />

          <WebDavSettings
            config={config}
            onUpdate={(newConfig) => setConfig(newConfig)}
          />

          <div className="flex justify-end pt-4">
            <Button
              label="保存全局设置"
              loading={saving}
              onClick={handleSave}
              className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default OptionsPage
