/**
 * HTTP 协议状态码（RFC 7231）
 */
export const HttpStatus = {
    // 成功
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    // 客户端错误
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,

    // 服务端错误
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const

/**
 * WebDAV 协议扩展状态码（RFC 4918）
 * 仅包含 WebDAV 特有的状态码，不包含 HTTP 通用状态码
 */
export const WebDAVStatus = {
    // WebDAV 成功状态码
    MULTI_STATUS: 207,

    // WebDAV 客户端错误
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    UNSUPPORTED_MEDIA_TYPE: 415,
    LOCKED: 423,

    // WebDAV 服务端错误
    INSUFFICIENT_STORAGE: 507,
} as const


/**
 * HTTP 状态码对应的中文错误消息
 */
export const HttpStatusMessage: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: "请求格式错误",
    [HttpStatus.UNAUTHORIZED]: "认证失败：凭据无效",
    [HttpStatus.FORBIDDEN]: "权限不足：访问被拒绝",
    [HttpStatus.NOT_FOUND]: "资源不存在",
    [HttpStatus.METHOD_NOT_ALLOWED]: "方法不允许",
    [HttpStatus.INTERNAL_SERVER_ERROR]: "服务器内部错误",
    [HttpStatus.BAD_GATEWAY]: "网关错误",
    [HttpStatus.SERVICE_UNAVAILABLE]: "服务暂时不可用",
    [HttpStatus.GATEWAY_TIMEOUT]: "网关超时",
}

/**
 * WebDAV 扩展状态码对应的中文错误消息
 */
export const WebDAVStatusMessage: Record<number, string> = {
    [WebDAVStatus.MULTI_STATUS]: "多状态响应",
    [WebDAVStatus.CONFLICT]: "冲突：父目录可能不存在",
    [WebDAVStatus.PRECONDITION_FAILED]: "前置条件失败",
    [WebDAVStatus.UNSUPPORTED_MEDIA_TYPE]: "不支持的媒体类型",
    [WebDAVStatus.LOCKED]: "资源被锁定",
    [WebDAVStatus.INSUFFICIENT_STORAGE]: "存储空间不足",
}
