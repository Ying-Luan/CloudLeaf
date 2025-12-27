import packageInfo from "package.json"
import "./index.css"
import { useSync } from "~src/hooks"
import { setBookmarks } from "~src/core/bookmark"
import Button from "~src/components/Button"

function IndexPopup() {
  const { loading, error, performUpload, performDownload } = useSync()
  const version = packageInfo.version

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  const handleUpload = async () => {
    const result = await performUpload()
    if (!result.success) return
    if (result.data.status === 'behind') {
      if (confirm("云端数据较新，是否强制上传覆盖？")) {
        await performUpload(true)
        alert("强制上传成功")
      }
    } else {
      await performUpload(true)
      alert("上传成功")
    }
  }

  const handleDownload = async () => {
    const result = await performDownload()
    if (!result.success) return
    if (result.data.status === 'ahead') {
      if (confirm("本地数据较新，是否强制下载覆盖？")) {
        await setBookmarks(result.data.payload)
        alert("强制下载成功")
      }
    } else {
      await setBookmarks(result.data.payload)
      alert("下载成功")
    }
  }

  return (
    <div className="w-60 p-5 bg-white flex flex-col gap-6">
      <header className="flex justify-between items-baseline border-b border-slate-100 pb-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">CloudLeaf</h2>
        <span className="text-sm font-mono text-slate-400 tracking-tight">v{version}</span>

        <button
          onClick={openSettings}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer group"
          title="打开设置"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-3">
        <Button
          label="上传书签"
          onClick={handleUpload}
          loading={loading}
        />

        <Button
          label="下载书签"
          onClick={handleDownload}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default IndexPopup
