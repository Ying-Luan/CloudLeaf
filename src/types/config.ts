/**
 * 用户总配置接口
 */
export interface UserConfig {
  gist: GistConfig
  jianguoyun: BaseWebDAVConfig
  customWebdav: CustomWebDAVConfig[]
  lastSyncAt: number
}

/**
 * GitHub Gist 配置接口
 */
export interface GistConfig {
  enabled: boolean
  accessToken: string
  gistId: string
  fileName: string
}

/**
 * WebDAV 基础配置接口
 * 所有 WebDAV 服务通用
 */
export interface BaseWebDAVConfig {
  enabled: boolean
  serverUrl: string
  username: string
  password: string
  filePath: string
}

/**
 * 自定义 WebDAV 配置接口
 * 继承基础配置，添加标识字段
 */
export interface CustomWebDAVConfig extends BaseWebDAVConfig {
  id: string
  name: string
}

