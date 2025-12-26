import { useEffect, useState } from "react"
import { WebDAVRegistry } from "~src/providers"
import Input from "./Input"
import Button from "./Button"
import Select from "./Select"
import type { UserConfig, WebDAVUserConfig } from "~src/types"
import { DEFAULT_WEBDAV_FILEPATH } from "~src/constants"
import { loadCustomVendorsFromConfig } from "~src/store"


interface WebDavSettingsProps {
  config: UserConfig | null
  onUpdate: (newConfig: UserConfig) => void
}

const WebDavSettings = ({ config, onUpdate }: WebDavSettingsProps) => {
  // 这里的表单状态仅用于“新增账号”
  const [form, setForm] = useState<WebDAVUserConfig>({
    vendorId: "jianguoyun",
    username: "",
    password: "",
    filePath: DEFAULT_WEBDAV_FILEPATH,
    enabled: true
  })

  useEffect(() => {
    // 每次组件加载时，确保注册自定义厂商
    if (config) loadCustomVendorsFromConfig(config)
  }, [config])

  // 获取所有可用厂商（预置 + 自定义）
  const vendors = WebDAVRegistry.getAllVendors().map(v => ({ label: v.name, value: v.id }))

  const handleAdd = () => {
    if (!form.username || !form.password) return alert("请填写完整信息")

    const newWebDavConfigs = [...(config?.webDavConfigs || []), { ...form }]
    onUpdate({ ...config!, webDavConfigs: newWebDavConfigs })

    setForm({ ...form, username: "", password: "" })
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800">WebDAV 账号管理</h3>
      </div>

      {/* 新增账号表单 */}
      <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="选择云厂商"
            value={form.vendorId}
            options={vendors}
            onChange={(val) => setForm({ ...form, vendorId: val })}
          />
          <Input
            label="用户名"
            value={form.username}
            onChange={(val) => setForm({ ...form, username: val })}
            placeholder="Account Email"
          />
        </div>

        <Input
          label="应用密码"
          value={form.password}
          type="password"
          onChange={(val) => setForm({ ...form, password: val })}
          placeholder="App Password"
        />

        <Input
          label="存储文件路径(必须位于某一文件夹下)"
          value={form.filePath}
          onChange={(val) => setForm({ ...form, filePath: val || DEFAULT_WEBDAV_FILEPATH })}
          placeholder={DEFAULT_WEBDAV_FILEPATH}
        />

        <Button
          label="确认添加 WebDAV 账号"
          onClick={handleAdd}
          className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
        />
      </div>
    </section>
  )
}

export default WebDavSettings
