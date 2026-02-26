/**
 * Bookmark node structure
 * 
 * @remarks Supports nested folder hierarchy via children property
 */
export interface BookMark {
  /**
   * Display title of the bookmark or folder
   */
  title: string
  /**
   * URL of the bookmark, undefined for folders
   */
  url?: string
  /**
   * Child bookmarks, present for folders
   */
  children?: BookMark[]
}
