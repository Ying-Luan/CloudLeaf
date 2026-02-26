/**
 * Indicates whether current runtime is development mode.
 * @readonly
 */
const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Supported scope values for logger tagging.
 * @remarks Keep this list synchronized with actual module paths used in logger calls.
 */
type LogScope =
  | 'core/sync/cloud'
  | 'core/sync/local'
  | 'hooks/useSync'
  | 'popup'
  | 'providers/webdav'
  | 'utils/logger'

/**
 * Logger tag type used by {@link Logger}.
 * - `LogScope` Restricts tags to predefined module scopes
 */
type LogTag =
  | LogScope

/**
 * Lightweight logger with optional tag prefix.
 * @remarks Logging is disabled in non-development environments.
 */
class Logger {
  /**
   * Current logger tag used as log prefix.
   */
  private tag: LogTag | null

  /**
   * Creates a logger instance.
   * @param tag Optional tag name used as log prefix.
   */
  constructor(tag?: LogTag) {
    this.tag = tag || null
  }

  /**
   * Creates a new logger instance with a specific tag.
   * @param tag Tag name used as log prefix.
   * @returns A new tagged logger instance.
   */
  withTag(tag: LogTag) {
    return new Logger(tag)
  }

  /**
   * Gets an info logger function.
   * @returns A noop in production, or a bound console.info function in development.
   * @remarks It is recommended to use tagged loggers for better log organization, but untagged loggers are also supported.
   * @example
   * ```ts
   * logger.withTag('utils/logger').info('This is an info message with a tag')
   * ```
   */
  get info() {
    if (!IS_DEV) return () => { }

    if (this.tag)
      return console.info.bind(console, `[${this.tag}]`)

    return console.info.bind(console)
  }

  /**
   * Gets an error logger function.
   * @returns A noop in production, or a bound console.error function in development.
   * @remarks It is recommended to use tagged loggers for better log organization, but untagged loggers are also supported.
   * @example
   * ```ts
   * logger.withTag('utils/logger').error('This is an error message with a tag')
   * ```
   */
  get error() {
    if (!IS_DEV) return () => { }

    if (this.tag)
      return console.error.bind(console, `[${this.tag}]`)

    return console.error.bind(console)
  }
}

/**
 * Shared logger instance for app-wide usage.
 * @readonly
 */
export const logger = new Logger()
