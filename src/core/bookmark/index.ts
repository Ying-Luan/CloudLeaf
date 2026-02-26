/**
 * Bookmark core functions
 * 
 * @packageDocumentation
 */

import { type BookMark, type SyncPayload } from "~/src/types"
import { logger } from "~src/utils"

/**
 * maximum timestamp among all bookmark folders
 */
let maxTimestamp = 0
/**
 * number of bookmarks processed
 */
let numBookmarks = 0

/**
 * Recursively process a chrome bookmark node into the internal `BookMark` interface.
 * 
 * Updates module-level counters `maxTimestamp` and `numBookmarks` as a side effect.
 * 
 * @param node - Chrome bookmark tree node
 * 
 * @returns `BookMark` when the node represents a folder or a valid bookmark, otherwise `null`
 */
function processBookmarkNode(node: chrome.bookmarks.BookmarkTreeNode): BookMark | null {
  // folder node
  if (node.children) {
    maxTimestamp = Math.max(maxTimestamp, node.dateGroupModified || 0)
    const children = node.children
      .map(child => processBookmarkNode(child))
      .filter((child): child is BookMark => child !== null)
    return {
      title: node.title,
      children: children
    }
  }

  // leaf bookmark node
  if (node.title && node.url) {
    numBookmarks++
    return {
      title: node.title,
      url: node.url
    }
  }

  // invalid node
  return null
}

/**
 * Get bookmarks from the browser and convert to `SyncPayload`.
 * 
 * @returns Sync payload containing `bookmarks`, `numBookmarks`, and `updatedAt` timestamp.
 */
export async function getBookmarks(): Promise<SyncPayload> {
  try {
    const tree = await chrome.bookmarks.getTree()
    const collects = tree[0].children
    maxTimestamp = 0
    numBookmarks = 0
    const bookmarks = collects
      .map(child => processBookmarkNode(child))
      .filter((child): child is BookMark => child !== null)
    return { updatedAt: maxTimestamp || Date.now(), numBookmarks, bookmarks }

    // error
  } catch (error) {
    logger.withTag('core/bookmark').error('Failed to get bookmarks:', error)
    return { updatedAt: Date.now(), numBookmarks: 0, bookmarks: [] }
  }
}

/**
 * Create bookmark nodes under the given parent ID.
 * 
 * Recursively creates folders and bookmarks according to the `BookMark` structure.
 * 
 * @param parentId - Parent bookmark folder ID
 * @param nodes - Array of `BookMark` nodes to create
 */
async function createBookmarkNodes(parentId: string, nodes: BookMark[]): Promise<void> {
  for (const node of nodes) {
    // folder node
    if (node.children && node.children.length > 0) {
      const folder = await chrome.bookmarks.create({ parentId, title: node.title })
      await createBookmarkNodes(folder.id, node.children)
      // leaf bookmark node
    } else {
      await chrome.bookmarks.create({ parentId, title: node.title, url: node.url })
    }
  }
}

/**
 * Replace current browser bookmarks with the provided payload.
 * 
 * Clears existing user folders (preserving system root folders) and recreates nodes from `payload.bookmarks`.
 * 
 * @param payload - Sync payload containing the bookmark tree to set
 */
export async function setBookmarks(payload: SyncPayload): Promise<void> {
  const tree = await chrome.bookmarks.getTree()
  const root = tree[0]

  // --- remove all bookmarks except system folders --- 
  if (root.children) {
    for (const child of root.children) {
      // System reserved folder IDs are usually '1' (Bookmarks Bar), '2' (Other Bookmarks), '3' (Mobile Bookmarks)
      const isSystemFolder = ['1', '2', '3'].includes(child.id)
      if (isSystemFolder) {
        if (child.children)
          for (const grandChild of child.children)
            await chrome.bookmarks.removeTree(grandChild.id).catch(() => { })
      } else {
        await chrome.bookmarks.removeTree(child.id).catch(() => { })
      }
    }
  }

  // --- create new bookmarks from payload ---
  const [bar, other, mobile, ...rest] = payload.bookmarks
  if (bar && bar.children) await createBookmarkNodes('1', bar.children)
  if (other && other.children) await createBookmarkNodes('2', other.children)
  if (mobile && mobile.children) await createBookmarkNodes('3', mobile.children)
  if (rest && rest.length > 0) await createBookmarkNodes(root.id, rest)
}
