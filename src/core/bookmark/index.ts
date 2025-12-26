import { type BookMark, type SyncPayload } from "~/src/types"
import { updateUserConfig } from "~src/store"


let maxTimestamp = 0
let numBookmarks = 0

function processBookmarkNode(node: chrome.bookmarks.BookmarkTreeNode): BookMark | null {
  // 节点为文件夹
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

  // 节点为书签
  if (node.title && node.url) {
    numBookmarks++
    return {
      title: node.title,
      url: node.url
    }
  }

  return null
}

/**
 * 从浏览器获取书签
 * @returns {Promise<SyncPayload>} 包含书签数据的同步负载
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
  } catch (error) {
    console.error("Failed to get bookmarks:", error)
    return { updatedAt: Date.now(), numBookmarks: 0, bookmarks: [] }
  }
}

async function createBookmarkNodes(parentId: string, nodes: BookMark[]): Promise<void> {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const folder = await chrome.bookmarks.create({ parentId, title: node.title })
      await createBookmarkNodes(folder.id, node.children)
    } else {
      await chrome.bookmarks.create({ parentId, title: node.title, url: node.url })
    }
  }
}

export async function setBookmarks(payload: SyncPayload): Promise<void> {
  const tree = await chrome.bookmarks.getTree()
  const root = tree[0]

  if (root.children) {
    for (const child of root.children) {
      // 系统保留文件夹的 ID 通常是 '1' (书签栏), '2' (其他书签), '3' (移动书签)
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

  const [bar, other, mobile, ...rest] = payload.bookmarks
  if (bar && bar.children) await createBookmarkNodes('1', bar.children)
  if (other && other.children) await createBookmarkNodes('2', other.children)
  if (mobile && mobile.children) await createBookmarkNodes('3', mobile.children)
  if (rest && rest.length > 0) await createBookmarkNodes(root.id, rest)

  await updateUserConfig({
    lastSyncAt: Date.now()
  })
}
