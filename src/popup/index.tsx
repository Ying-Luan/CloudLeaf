import { useEffect, useState } from "react"
import packageInfo from "../../package.json"
import "./index.css"
import { getBookmarks } from "~src/core/bookmark"

function IndexPopup() {
  useEffect(() => {
    console.log("Popup loaded")
    getBookmarks().then(bookmarks => {
      console.log("Bookmarks:", bookmarks)
    })
  }, [])

  const version = packageInfo.version

  return (
    <div className="w-60 p-5 bg-white flex flex-col gap-6">
      <header className="flex justify-between items-baseline border-b border-slate-100 pb-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">CloudLeaf</h2>
        <span className="text-sm font-mono text-slate-400 tracking-tight">v{version}</span>
      </header>

      <div className="flex flex-col gap-3">
        <button className="w-full py-2 bg-white text-black border border-slate-200 rounded-md hover:bg-slate-50 transition-all activate:scale-95 cursor-pointer font-medium">
          上传书签
        </button>

        <button className="w-full py-2 bg-white text-black border border-slate-200 rounded-md hover:bg-slate-50 transition-all activate:scale-95 cursor-pointer font-medium">
          下载书签
        </button>
      </div>
    </div>
  )
}

export default IndexPopup
