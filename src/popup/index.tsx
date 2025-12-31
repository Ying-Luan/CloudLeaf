import packageInfo from "package.json"
import "./index.css"
import { useSync } from "~src/hooks"
import { setBookmarks } from "~src/core/bookmark"
import { Button } from "~src/components"
import { messages } from "~/src/i18n"

/**
 * Popup page component for CloudLeaf extension.
 *
 * Provides quick access to upload and download bookmarks, with automatic
 * conflict detection and resolution prompts.
 * @returns A JSX element rendering the popup interface
 */
function IndexPopup() {
  // Sync operations and state from useSync hook
  const { loading, error, performUpload, performDownload, performExport, performImport } = useSync()
  /**
   * Extension version from package.json.
   */
  const version = packageInfo.version

  /**
   * Open the extension's options page.
   */
  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  /**
   * Handle bookmark upload with conflict detection.
   *
   * Checks sync status and prompts user if cloud data is newer,
   * allowing force upload if confirmed.
   */
  const handleUpload = async () => {
    if (process.env.NODE_ENV === 'development') console.log("[popup] Starting upload...")
    const result = await performUpload()
    if (!result.ok) {
      alert(messages.alert.uploadFailed(result.error || messages.error.unknownError()))
      return
    }
    // status === 'behind' means cloud data is newer
    if (result.data.status === 'behind') {
      if (confirm(messages.confirm.forceUpload())) {
        await performUpload(true)
        alert(messages.alert.forceUploadSuccess())
      }
      // status === 'none' means no provider configured
    } else if (result.data.status === 'none') {
      alert(messages.alert.noProvider())
      // Normal case: upload succeeded without conflicts
    } else {
      await performUpload(true)
      alert(messages.alert.uploadSuccess())
    }
  }

  /**
   * Handle bookmark download with conflict detection.
   *
   * Checks sync status and prompts user if local data is newer,
   * allowing force download if confirmed.
   */
  const handleDownload = async () => {
    const result = await performDownload()
    if (!result.ok) {
      alert(messages.alert.downloadFailed(result.error || messages.error.unknownError()))
      return
    }
    // status === 'ahead' means local data is newer
    if (result.data.status === 'ahead') {
      if (confirm(messages.confirm.forceDownload())) {
        await setBookmarks(result.data.payload)
        alert(messages.alert.forceDownloadSuccess())
      }
      // status === 'none' means no provider configured
    } else if (result.data.status === 'none') {
      alert(messages.alert.noProvider())
      // Normal case: download succeeded without conflicts
    } else {
      await setBookmarks(result.data.payload)
      alert(messages.alert.downloadSuccess())
    }
  }

  /**
   * Handle bookmark export to local file.
   */
  const handleExport = async () => {
    const result = await performExport()
    if (!result.ok) {
      alert(messages.alert.exportFailed(result.error || messages.error.unknownError()))
      return
    }
    alert(messages.alert.exportSuccess())
  }

  /**
   * Handle bookmark import from local file.
   * 
   * Checks sync status and prompts user if local data is newer,
   * allowing force import if confirmed.
   */
  const handleImport = async () => {
    const result = await performImport()
    if (!result.ok) {
      if (process.env.NODE_ENV === 'development')
        console.error("[popup/index] Import failed:", result.error)
      alert(messages.alert.importFailed(result.error || messages.error.unknownError()))
      return
    }
    if (result.data.status === 'ahead') {
      if (confirm(messages.confirm.forceImport())) {
        await setBookmarks(result.data.payload)
        alert(messages.alert.forceImportSuccess())
      }
    } else {
      await setBookmarks(result.data.payload)
      alert(messages.alert.importSuccess())
    }
  }

  /**
   * Handle opening the side panel to preview cloud bookmarks.
   */
  const handleOpenPreview = async () => {
    try {
      const window = await chrome.windows.getCurrent()
      await chrome.sidePanel.open({ windowId: window.id })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error("Failed to open side panel")
    }
  }

  return (
    <div className="w-60 p-3 bg-white flex flex-col gap-3">
      {/* Header */}
      <header className="flex justify-between items-baseline border-b border-slate-100 pb-2">
        {/* Title */}
        <h2 className="flex-1 text-xl font-bold text-slate-800 tracking-tight">CloudLeaf</h2>

        {/* Version */}
        <span className="text-sm font-mono text-slate-400 tracking-tight">v{version}</span>

        {/* Buttons to preview and open settings */}
        <div className="flex items-center gap-1">
          {/* Preview button */}
          <button
            onClick={handleOpenPreview}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
            title={messages.ui.previewCloud()}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Settings button */}
          <button
            onClick={openSettings}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer group"
            title={messages.ui.openSettings()}
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {/* Button to upload bookmarks */}
        <Button
          label={messages.ui.uploadBookmarks()}
          onClick={handleUpload}
          loading={loading}
        />

        {/* Button to download bookmarks */}
        <Button
          label={messages.ui.downloadBookmarks()}
          onClick={handleDownload}
          loading={loading}
        />

        {/* Buttons to export and import bookmarks */}
        <div className="flex gap-3">
          {/* Button to export bookmarks */}
          <Button
            label={messages.ui.exportBookmarks()}
            onClick={handleExport}
            loading={loading}
          />

          {/* Button to import bookmarks */}
          <Button
            label={messages.ui.importBookmarks()}
            onClick={handleImport}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
