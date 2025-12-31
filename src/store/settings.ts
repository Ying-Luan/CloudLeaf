import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { type UserConfig, DEFAULT_USER_CONFIG, type GistConfig, type WebDAVUserConfig } from "~src/types"
import { getUserConfig, setUserConfig, getMaxPriority } from "./config"
import { messages } from "~/src/i18n"

/**
 * Settings store using Zustand + Immer
 * 
 * Manages user configuration in memory. Persistence only happens when
 * explicitly calling persistConfig() (typically on save button click)
 */
interface SettingsState {
  // --- Data Layer ---
  /**
   * User configuration data, null when not initialized
   */
  config: UserConfig

  // --- UI Layer ---
  /**
   * Initialization in progress
   */
  initializing: boolean
  /**
   * Saving in progress
   */
  saving: boolean

  // --- Action Layer ---
  /**
   * Load configuration from storage into memory
   * 
   * Only true when `loadConfig` and `persistConfig` are in progress
   */
  loadConfig: () => Promise<void>
  /**
   * Update configuration in memory using Immer draft (does not persist to storage)
   * @param updater updater function that receives a draft of UserConfig
   * @example
   * ```ts
   * updateConfig(draft => {
   *   draft.gist.priority = 5
   *   draft.webDavConfigs[0].enabled = false
   * })
   * ```
   */
  updateConfig: (updater: (draft: UserConfig) => void) => void
  /**
   * Update Gist configuration in memory using Immer draft (does not persist to storage)
   * @param updater updater function that receives a draft of GistConfig
   *  @example
   * ```ts
   * updateGistConfig(draft => {
   *  draft.enabled = true
   * })
   * ```
   */
  updateGistConfig: (updater: (draft: GistConfig) => void) => void
  /**
   * Update WebDAV configuration in memory using Immer draft (does not persist to storage)
   * @param updater updater function that receives a draft of WebDAVUserConfig[]
   * @example
   * ```ts
   * updateWebDavConfigs(draft => {
   *  draft.slice(0, 1)
   * })
   * ```
   */
  updateWebDavConfigs: (updater: (draft: WebDAVUserConfig[]) => void) => void
  /** 
   * Persist current state to storage
   * Call this when user clicks save button
   */
  persistConfig: (force?: boolean) => Promise<void>
  /**
   * Get the next available priority value
   */
  getNextPriority: () => Promise<number>
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    // --- initial state ---
    config: DEFAULT_USER_CONFIG,
    initializing: false,
    saving: false,

    // --- Actions ---
    /**
     * Load user configuration from storage into memory
     */
    loadConfig: async () => {
      set((state) => { state.initializing = true })
      const config = await getUserConfig()
      set((state) => { state.config = config })
      set((state) => { state.initializing = false })
    },

    /**
     * Update configuration in memory using Immer draft (does not persist to storage)
     * @param updater updater function that receives a draft of UserConfig
     * @example
     * ```ts
     * updateConfig(draft => {
     *   draft.gist.priority = 5
     *   draft.webDavConfigs[0].enabled = false
     * })
     * ```
     */
    updateConfig: (updater: (draft: UserConfig) => void) => {
      set((state) => {
        updater(state.config)
      })
    },

    /**
     * Update Gist configuration in memory using Immer draft (does not persist to storage)
     * @param updater updater function that receives a draft of GistConfig
     * @example
     * ```ts
     * updateGistConfig(draft => {
     *  draft.enabled = true
     * })
     * ```
     */
    updateGistConfig: (updater: (draft: GistConfig) => void) => {
      set((state) => {
        updater(state.config.gist!)
      })
    },

    /**
     * Update WebDAV configuration in memory using Immer draft (does not persist to storage)
     * @param updater updater function that receives a draft of WebDAVUserConfig
     * @example
     * ```ts
     * updateWebDavConfigs(draft => {
     *  draft.enabled = false
     * })
     * ```
     */
    updateWebDavConfigs: (updater: (draft: WebDAVUserConfig[]) => void) => {
      set((state) => {
        updater(state.config.webDavConfigs!)
      })
    },

    /**
     * Persist current state to storage
     * Call this when user clicks save button
     */
    persistConfig: async (force: boolean = false) => {
      set((state) => { state.saving = true })
      const { config } = get()
      await setUserConfig(config)
      set((state) => { state.saving = false })

      if (!force) alert(messages.alert.settingsSaved())
    },

    /**
     * Get the next available priority value
     */
    getNextPriority: async () => {
      return await getMaxPriority() + 1
    },
  }))
)
