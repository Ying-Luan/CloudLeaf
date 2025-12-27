/**
 * HTTP protocol status codes (RFC 7231)
 * @readonly
 */
export const HttpStatus = {
    // --- Success ---
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    // --- Client Errors ---
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,

    // --- Server Errors ---
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const

/**
 * WebDAV protocol extended status codes (RFC 4918)
 * @remarks Only includes WebDAV-specific codes, not general HTTP codes
 * @readonly
 */
export const WebDAVStatus = {
    // --- WebDAV Success ---
    MULTI_STATUS: 207,

    // --- WebDAV Client Errors ---
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    UNSUPPORTED_MEDIA_TYPE: 415,
    LOCKED: 423,

    // --- WebDAV Server Errors ---
    INSUFFICIENT_STORAGE: 507,
} as const

/**
 * HTTP status code to error message
 * @readonly
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
 * WebDAV extended status code to error message
 * @readonly
 */
export const WebDAVStatusMessage: Record<number, string> = {
    [WebDAVStatus.MULTI_STATUS]: "多状态响应",
    [WebDAVStatus.CONFLICT]: "冲突：父目录可能不存在",
    [WebDAVStatus.PRECONDITION_FAILED]: "前置条件失败",
    [WebDAVStatus.UNSUPPORTED_MEDIA_TYPE]: "不支持的媒体类型",
    [WebDAVStatus.LOCKED]: "资源被锁定",
    [WebDAVStatus.INSUFFICIENT_STORAGE]: "存储空间不足",
}
