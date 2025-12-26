import packageInfo from "package.json"
import "./index.css"
import { useSync } from "~src/hooks/useSync"
import { setBookmarks } from "~src/core/bookmark"
import Button from "~src/components/Button"

function IndexPopup() {
  const { loading, error, performUpload, performDownload } = useSync()
  const version = packageInfo.version

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
