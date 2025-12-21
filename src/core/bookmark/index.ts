import { type BookMark, type SyncPayload } from "../../types"


function processBookmarkNode(node: chrome.bookmarks.BookmarkTreeNode): BookMark | null {
  if (node.children) {
    const children = node.children
      .map(child => processBookmarkNode(child))
      .filter((child): child is BookMark => child !== null)

    return {
      title: node.title,
      children: children
    }
  }

  if (node.title && node.url)
    return {
      title: node.title,
      url: node.url
    }

  return null
}

export async function getBookmarks(): Promise<SyncPayload> {
  try {
    const tree = await chrome.bookmarks.getTree()
    const bookmarks = tree[0].children[0].children
      .map(child => processBookmarkNode(child))
      .filter((child): child is BookMark => child !== null)
    return { updatedAt: Date.now(), bookmarks }
  } catch (error) {
    console.error("Failed to get bookmarks:", error)
    return { updatedAt: Date.now(), bookmarks: [] }
  }
}
