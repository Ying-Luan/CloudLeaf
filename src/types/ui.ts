export interface SourceItem {
  type: "gist" | "webdav"
  id: string
  label: string
  priority: number
  rawIndex?: number
}
