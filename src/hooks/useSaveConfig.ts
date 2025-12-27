import { useState } from "react"
import { updateUserConfig } from "~src/store"
import { type UserConfig } from "~src/types"


/**
 * Hook to save user configuration.
 * @returns
 * - `saving`: whether a save operation is in progress
 * - `saveConfig(config, force?)`: persist `config` and optionally suppress the success alert
 */
export function useSaveConfig() {
  const [saving, setSaving] = useState(false)

  /**
   * Persist user configuration to storage.
   * @param config User configuration to persist
   * @param force When true, suppress the success alert
   * @remarks The UI shows an alert when `force` is `false`.
   */
  const saveConfig = async (config: UserConfig, force: boolean = false) => {
    if (!config) return
    setSaving(true)
    await updateUserConfig(config)
    setSaving(false)

    if (!force) alert("设置已保存")
  }

  return { saving, saveConfig }
}
