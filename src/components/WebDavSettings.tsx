import { useEffect, useState } from "react"
import { WebDAVRegistry } from "~src/providers"
import Input from "./Input"
import Button from "./Button"
import Select from "./Select"
import type { WebDAVUserConfig } from "~src/types"
import { DEFAULT_WEBDAV_FILEPATH } from "~src/constants"
import { loadCustomVendorsFromConfig, useSettingsStore } from "~src/store"

/**
 * Props for the `WebDavSettings` component.
 *
 * Represents the current user configuration and an update callback.
 */
interface WebDavSettingsProps {
  /**
   * Edit mode or add mode (default: add)
   */
  mode?: "add" | "edit"
  /**
   * When editing, the index in webDavConfigs to edit
   */
  editingIndex?: number | null
  /**
   * Close the WebDAV settings panel
   */
  onClose: () => void
}

/**
 * Component for managing WebDAV account configurations.
 *
 * Allows users to add new WebDAV accounts by providing vendor, credentials,
 * and file path information.
 * @param props WebDavSettings component properties
 * @returns A JSX element rendering the WebDAV account form
 */
const WebDavSettings = ({ mode = "add", editingIndex = null, onClose }: WebDavSettingsProps) => {
  // Store state & actions
  const config = useSettingsStore(state => state.config)
  const saving = useSettingsStore(state => state.saving)
  const updateConfig = useSettingsStore(state => state.updateConfig)
  const persistConfig = useSettingsStore(state => state.persistConfig)
  const getNextPriority = useSettingsStore(state => state.getNextPriority)

  // Form state for adding a new WebDAV account.
  const [form, setForm] = useState<WebDAVUserConfig>({
    vendorId: "jianguoyun",
    username: "",
    password: "",
    filePath: DEFAULT_WEBDAV_FILEPATH,
    enabled: true,
    priority: Number.MAX_SAFE_INTEGER,
  })

  useEffect(() => {
    // Load custom vendors on component mount
    if (config) loadCustomVendorsFromConfig(config)
  }, [config])

  // initial form
  useEffect(() => {
    if (!config) return
    if (mode === "edit" && editingIndex != null && editingIndex >= 0) {
      const existing = config.webDavConfigs?.[editingIndex]
      if (existing) {
        setForm({ ...existing })
      }
    } else {
      setForm({
        vendorId: "jianguoyun",
        username: "",
        password: "",
        filePath: DEFAULT_WEBDAV_FILEPATH,
        enabled: true,
        priority: Number.MAX_SAFE_INTEGER,
      })
    }
  }, [])

  /**
   * All available vendors (built-in + custom).
   */
  const vendors = WebDAVRegistry.getAllVendors().map(v => ({ label: v.name, value: v.id }))

  /**
   * Add a new WebDAV account to the configuration.
   *
   * Validates form inputs, assigns next priority, updates config,
   * and resets username/password fields.
   */
  const handleSubmit = async () => {
    if (!form.username || !form.password) return alert("请填写完整信息")
    if (mode === "add") {
      const priority = await getNextPriority()
      updateConfig(draft => {
        draft.webDavConfigs.push({ ...form, priority })
      })
      persistConfig()
      onClose()
    } else {
      if (editingIndex == null || editingIndex < 0) return
      updateConfig(draft => {
        const list = draft.webDavConfigs
        if (!list[editingIndex]) return
        list[editingIndex] = { ...form, priority: list[editingIndex].priority }
      })
      persistConfig()
      onClose()
    }
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-50">
        {/* Icon container */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800">{mode === "edit" ? "编辑 WebDAV 账号" : "WebDAV 账号管理"}</h3>
        </div>

        {/* Button to close the settings panel */}
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">取消</button>
      </div>

      {/* Add account form */}
      <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
        {/* Vendor and username inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Vendor select */}
          <Select
            label="选择云厂商"
            value={form.vendorId}
            options={vendors}
            onChange={(val) => setForm({ ...form, vendorId: val })}
          />

          {/* Username input */}
          <Input
            label="用户名"
            value={form.username}
            onChange={(val) => setForm({ ...form, username: val })}
            placeholder="Account Email"
          />
        </div>

        {/* Password and file path inputs */}
        <Input
          label="应用密码"
          value={form.password}
          type="password"
          onChange={(val) => setForm({ ...form, password: val })}
          placeholder="App Password"
        />

        {/* File path input */}
        <Input
          label="存储文件路径(必须位于某一文件夹下)"
          value={form.filePath}
          onChange={(val) => setForm({ ...form, filePath: val || DEFAULT_WEBDAV_FILEPATH })}
          placeholder={DEFAULT_WEBDAV_FILEPATH}
        />

        {/* Add account button */}
        <Button
          label={mode === "edit" ? "保存修改" : "确认添加 WebDAV 账号"}
          onClick={handleSubmit}
          loading={saving}
          className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
        />
      </div>
    </section>
  )
}

export default WebDavSettings
