import { useState } from "react"
import { updateUserConfig } from "~src/store"
import { type UserConfig } from "~src/types"


export function useSaveConfig() {
  const [saving, setSaving] = useState(false)

  const saveConfig = async (config: UserConfig, force: boolean = false) => {
    if (!config) return
    setSaving(true)
    await updateUserConfig(config)
    setSaving(false)

    if (!force) alert("设置已保存")
  }

  return { saving, saveConfig }
}
