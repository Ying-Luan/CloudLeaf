/**
 * 书签类型定义
 */
export interface BookMark {
  title: string
  url?: string
  children?: BookMark[]
}
