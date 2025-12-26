/**
 * 用户总配置（持久化）
 */
export interface UserConfig {
  /** Gist 配置 */
  gist?: GistConfig
  /** WebDAV 账号配置列表 */
  webDavConfigs?: WebDAVUserConfig[]
  /** 自定义云厂商元数据列表 */
  customVendors?: CustomVendorConfig[]
  /** 上次同步时间 */
  lastSyncAt: number
}

/**
 * GitHub Gist 配置
 */
export interface GistConfig {
  enabled?: boolean
  accessToken: string
  gistId: string
  fileName?: string
  priority?: number
}

/**
 * WebDAV 用户账号配置
 * 只存储用户凭据和关联的云厂商 ID
 */
export interface WebDAVUserConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 云厂商 ID（关联到 WebDAVRegistry） */
  vendorId?: string
  username: string
  password: string
  serverUrl?: string
  filePath: string
  /** 优先级，数值越小优先级越高 */
  priority?: number
}

/**
 * 自定义云厂商元数据配置
 * 启动时会加载到 WebDAVRegistry
 * 只包含服务商信息，不包含用户特定配置
 */
export interface CustomVendorConfig {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 服务器地址 */
  serverUrl: string
}

/**
 * 默认用户配置
 */
export const DEFAULT_USER_CONFIG: UserConfig = {
  gist: undefined,
  webDavConfigs: [],
  customVendors: [],
  lastSyncAt: 0,
}
