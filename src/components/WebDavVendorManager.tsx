import { useState, useEffect } from "react"
import { addCustomVendorToConfig, removeCustomVendorFromConfig, loadCustomVendorsFromConfig } from "~src/store"
import Input from "~src/components/Input"
import Button from "~src/components/Button"
import type { UserConfig, CustomVendorConfig } from "~src/types"
import { WebDAVRegistry } from "~src/providers"


interface WebDavVendorManagerProps {
  config: UserConfig | null
  onUpdate: (newConfig: UserConfig) => void
}

const WebDavVendorManager = ({ config, onUpdate }: WebDavVendorManagerProps) => {
  const [vendorForm, setVendorForm] = useState<CustomVendorConfig>({
    id: "",
    name: "",
    serverUrl: "",
  })

  useEffect(() => {
    // 每次组件加载时，确保注册自定义厂商
    if (config) loadCustomVendorsFromConfig(config)
  }, [config])

  const allAvailableVendors = [
    ...WebDAVRegistry.getPresetVendors().map(v => ({ ...v, type: 'preset' })),
    ...WebDAVRegistry.getCustomVendors().map(v => ({ ...v, type: 'custom' }))
  ]

  // 处理添加云厂商
  const handleAddVendor = () => {
    const { id, name, serverUrl } = vendorForm
    if (!id || !name || !serverUrl) return alert("请填写完整的厂商信息")
    try {
      const newVendors = addCustomVendorToConfig(config!, vendorForm)

      onUpdate({ ...config!, customVendors: newVendors })

      setVendorForm({ id: "", name: "", serverUrl: "" })
      alert(`已成功注册云厂商: ${name}`)
    } catch (e) {
      alert(`添加失败: ${String(e)}`)
    }
  }

  // 处理删除云厂商
  const handleDeleteVendor = (id: string) => {
    if (!confirm("确定删除该厂商？关联的账号可能失效")) return

    try {
      const newVendors = removeCustomVendorFromConfig(config!, id)

      onUpdate({ ...config!, customVendors: newVendors })
      alert(`已成功删除云厂商`)
    } catch (e) {
      alert(`删除失败: ${String(e)}`)
    }
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      {/* 标题部分 */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-mono">自定义云厂商管理</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allAvailableVendors.map((v) => (
          <div key={v.id} className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-lg group relative">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-slate-700 font-mono">{v.name}</span>
              {/* 根据类型显示不同的 Badge */}
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${v.type === 'preset'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-emerald-100 text-emerald-600'
                }`}>
                {v.type === 'preset' ? 'Official' : 'Custom'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{v.serverUrl}</div>

            {/* 如果是自定义厂商，显示删除按钮 */}
            {v.type === 'custom' && (
              <button
                onClick={() => handleDeleteVendor(v.id)}
                className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-600 transition-all cursor-pointer font-mono"
              >
                [移除]
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 注册新厂商表单 */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="厂商 ID (唯一)"
            value={vendorForm.id}
            onChange={(val) => setVendorForm({ ...vendorForm, id: val })}
            placeholder="my-server"
          />
          <Input
            label="显示名称"
            value={vendorForm.name}
            onChange={(val) => setVendorForm({ ...vendorForm, name: val })}
            placeholder="我的私有云"
          />
        </div>
        <Input
          label="服务器 WebDAV 地址"
          value={vendorForm.serverUrl}
          onChange={(val) => setVendorForm({ ...vendorForm, serverUrl: val })}
          placeholder="https://dav.example.com/dav"
        />
        <Button
          label="保存并注册云厂商"
          onClick={handleAddVendor}
          className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
        />
      </div>
    </section>
  )
}

export default WebDavVendorManager
