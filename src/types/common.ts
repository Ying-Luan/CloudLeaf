/**
 * Generic result wrapper for async operations
 * @typeParam T The type of data returned on success
 */
export interface Result<T> {
  /**
   * Whether the operation succeeded
   */
  success: boolean
  /**
   * Result data, present when success is true
   */
  data?: T
  /**
   * Error message, present when success is false
   */
  error?: string
}
