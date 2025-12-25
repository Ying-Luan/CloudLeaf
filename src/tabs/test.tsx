import { useState, useEffect } from "react"
import { WebDAVRegistry, GistProvider } from "~src/providers"
import { getUserConfig, updateUserConfig, loadCustomVendorsFromConfig } from "~src/store"
import type { UserConfig, WebDAVUserConfig, CustomVendorConfig } from "~src/types"
import "./test.css"

function TestPage() {
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null)
    const [testResult, setTestResult] = useState<string>("")
    const [downloadedData, setDownloadedData] = useState<any>(null)

    // === 表单状态 ===
    // 自定义云厂商表单（包含账号信息）
    const [customVendorForm, setCustomVendorForm] = useState({
        id: "",
        name: "",
        serverUrl: "",
        username: "",
        password: "",
        filePath: "/CloudLeaf/bookmarks.json",
    })

    // 用户账号表单
    const [accountForm, setAccountForm] = useState({
        vendorId: "jianguoyun",
        username: "",
        password: "",
        filePath: "/CloudLeaf/test.json",
    })

    // Gist 配置表单
    const [gistForm, setGistForm] = useState({
        accessToken: "",
        gistId: "",
        fileName: "CloudLeaf.json",
    })

    // === 测试选择 ===
    const [selectedConfigType, setSelectedConfigType] = useState<"gist" | "webdav">("webdav")
    const [selectedWebDAVIndex, setSelectedWebDAVIndex] = useState(0)

    // 加载配置
    const loadConfig = async () => {
        const config = await getUserConfig()
        setUserConfig(config)
        loadCustomVendorsFromConfig(config)
    }

    useEffect(() => {
        loadConfig()
    }, [])

    // ========== 第一部分：配置 CRUD ==========

    // 添加自定义云厂商（同时包含账号）
    const addCustomVendor = async () => {
        setTestResult("➕ 添加自定义云厂商...")
        const results: string[] = []

        try {
            // 验证云厂商信息
            if (!customVendorForm.id || !customVendorForm.name || !customVendorForm.serverUrl) {
                results.push("❌ 请填写云厂商信息（ID、名称、服务器地址）")
                setTestResult(results.join("\n"))
                return
            }

            // 验证账号信息
            if (!customVendorForm.username || !customVendorForm.password || !customVendorForm.filePath) {
                results.push("❌ 请填写账号信息（用户名、密码、文件路径）")
                setTestResult(results.join("\n"))
                return
            }

            const config = await getUserConfig()

            // 1. 添加云厂商到注册表
            const vendorMeta = {
                id: customVendorForm.id,
                name: customVendorForm.name,
                serverUrl: customVendorForm.serverUrl,
            }
            WebDAVRegistry.addCustomVendor(vendorMeta)
            results.push(`✅ 添加到注册表: ${customVendorForm.name}`)

            // 2. 保存云厂商元数据到配置
            await updateUserConfig({
                customVendors: [...(config.customVendors || []), vendorMeta],
            })
            results.push("✅ 已保存云厂商到配置")

            // 3. 保存账号配置
            const reloadedConfig = await getUserConfig()
            const newAccount: WebDAVUserConfig = {
                vendorId: customVendorForm.id,
                username: customVendorForm.username,
                password: customVendorForm.password,
                filePath: customVendorForm.filePath,
                enabled: true,
            }
            await updateUserConfig({
                webDavConfigs: [...(reloadedConfig.webDavConfigs || []), newAccount],
            })
            results.push(`✅ 已保存账号: ${customVendorForm.username}`)

            await loadConfig()
            setCustomVendorForm({
                id: "",
                name: "",
                serverUrl: "",
                username: "",
                password: "",
                filePath: "/CloudLeaf/bookmarks.json",
            })

        } catch (e) {
            results.push(`❌ 错误: ${e}`)
        }

        setTestResult(results.join("\n"))
    }

    // 删除自定义云厂商
    const deleteCustomVendor = async (id: string) => {
        const config = await getUserConfig()
        const newVendors = config.customVendors?.filter(v => v.id !== id) || []

        WebDAVRegistry.removeCustomVendor(id)
        await updateUserConfig({ customVendors: newVendors })
        await loadConfig()
        setTestResult(`✅ 已删除自定义云厂商: ${id}`)
    }

    // 添加用户账号
    const addWebDAVAccount = async () => {
        setTestResult("➕ 添加 WebDAV 账号...")
        const results: string[] = []

        try {
            if (!accountForm.username || !accountForm.password || !accountForm.filePath) {
                results.push("❌ 请填写完整信息")
                setTestResult(results.join("\n"))
                return
            }

            const config = await getUserConfig()
            const newAccount: WebDAVUserConfig = {
                vendorId: accountForm.vendorId,
                username: accountForm.username,
                password: accountForm.password,
                filePath: accountForm.filePath,
                enabled: true,
            }

            await updateUserConfig({
                webDavConfigs: [...(config.webDavConfigs || []), newAccount],
            })

            results.push(`✅ 已添加账号: ${accountForm.username}`)
            results.push(`   云厂商: ${accountForm.vendorId}`)

            await loadConfig()
            setAccountForm({ ...accountForm, username: "", password: "" })

        } catch (e) {
            results.push(`❌ 错误: ${e}`)
        }

        setTestResult(results.join("\n"))
    }

    // 删除用户账号
    const deleteWebDAVAccount = async (index: number) => {
        const config = await getUserConfig()
        const newConfigs = [...(config.webDavConfigs || [])]
        newConfigs.splice(index, 1)

        await updateUserConfig({ webDavConfigs: newConfigs })
        await loadConfig()
        setTestResult(`✅ 已删除账号配置 #${index + 1}`)
    }

    // 保存 Gist 配置
    const saveGistConfig = async () => {
        setTestResult("💾 保存 Gist 配置...")
        const results: string[] = []

        try {
            if (!gistForm.accessToken || !gistForm.gistId) {
                results.push("❌ 请填写 Access Token 和 Gist ID")
                setTestResult(results.join("\n"))
                return
            }

            await updateUserConfig({
                gist: {
                    accessToken: gistForm.accessToken,
                    gistId: gistForm.gistId,
                    fileName: gistForm.fileName,
                    enabled: true,
                },
            })

            results.push("✅ 已保存 Gist 配置")
            await loadConfig()

        } catch (e) {
            results.push(`❌ 错误: ${e}`)
        }

        setTestResult(results.join("\n"))
    }

    // 删除 Gist 配置
    const deleteGistConfig = async () => {
        await updateUserConfig({ gist: undefined })
        await loadConfig()
        setTestResult("✅ 已删除 Gist 配置")
    }

    // ========== 第二部分：功能测试 ==========

    // 测试 isValid
    const testIsValid = async () => {
        setTestResult("🧪 测试 isValid...")
        const results: string[] = []

        try {
            if (selectedConfigType === "gist") {
                if (!userConfig?.gist) {
                    results.push("❌ 没有 Gist 配置")
                    setTestResult(results.join("\n"))
                    return
                }

                results.push("=== 测试 Gist isValid ===\n")
                const gist = new GistProvider(userConfig.gist.accessToken, userConfig.gist.gistId, userConfig.gist.fileName)
                const valid = await gist.isValid()

                results.push(`状态: ${valid.success ? "✅ 成功" : "❌ 失败"}`)
                results.push(`数据: ${valid.data ? "✅ 有效" : "❌ 无效"}`)
                if (valid.error) results.push(`错误: ${valid.error}`)
            } else {
                const config = userConfig?.webDavConfigs?.[selectedWebDAVIndex]
                if (!config) {
                    results.push("❌ 没有选中的 WebDAV 配置")
                    setTestResult(results.join("\n"))
                    return
                }

                results.push("=== 测试 WebDAV isValid ===\n")
                const provider = WebDAVRegistry.createProvider(config.vendorId || "jianguoyun", config)
                const valid = await provider.isValid()

                results.push(`状态: ${valid.success ? "✅ 成功" : "❌ 失败"}`)
                results.push(`数据: ${valid.data ? "✅ 有效" : "❌ 无效"}`)
                if (valid.error) results.push(`错误: ${valid.error}`)
            }
        } catch (e) {
            results.push(`❌ 错误: ${e}`)
        }

        setTestResult(results.join("\n"))
    }

    // 测试 upload
    const testUpload = async () => {
        setTestResult("🧪 测试 upload...")
        const results: string[] = []

        try {
            const testData = {
                updatedAt: Date.now(),
                bookmarks: [
                    { title: `测试书签 ${new Date().toLocaleTimeString()}`, url: "https://test.com" }
                ]
            }

            if (selectedConfigType === "gist") {
                if (!userConfig?.gist) {
                    results.push("❌ 没有 Gist 配置")
                    setTestResult(results.join("\n"))
                    return
                }

                results.push("=== 测试 Gist upload ===\n")
                const gist = new GistProvider(userConfig.gist.accessToken, userConfig.gist.gistId, userConfig.gist.fileName)
                const upload = await gist.upload(testData)

                results.push(`状态: ${upload.success ? "✅ 成功" : "❌ 失败"}`)
                if (upload.error) results.push(`错误: ${upload.error}`)
            } else {
                const config = userConfig?.webDavConfigs?.[selectedWebDAVIndex]
                if (!config) {
                    results.push("❌ 没有选中的 WebDAV 配置")
                    setTestResult(results.join("\n"))
                    return
                }

                results.push("=== 测试 WebDAV upload ===\n")
                const provider = WebDAVRegistry.createProvider(config.vendorId || "jianguoyun", config)
                const upload = await provider.upload(testData)

                results.push(`状态: ${upload.success ? "✅ 成功" : "❌ 失败"}`)
                if (upload.error) results.push(`错误: ${upload.error}`)
            }
        } catch (e) {
            results.push(`❌ 错误: ${e}`)
        }

        setTestResult(results.join("\n"))
    }

    // 测试 download
    const testDownload = async () => {
        setTestResult("🧪 测试 download...")
        const results: string[] = []

        try {
            if (selectedConfigType === "gist") {
                if (!userConfig?.gist) {
                    results.push("❌ 没有 Gist 配置")
                    setTestResult(results.join("\n"))
                    return
                }

                results.push("=== 测试 Gist download ===\n")
                const gist = new GistProvider(userConfig.gist.accessToken, userConfig.gist.gistId, userConfig.gist.fileName)
                const download = await gist.download()

                results.push(`状态: ${download.success ? "✅ 成功" : "❌ 失败"}`)
                if (download.data) {
                    setDownloadedData(download.data)
                    results.push(`\n数据:`)
                    results.push(`  更新时间: ${new Date(download.data.updatedAt).toLocaleString()}`)
                    results.push(`  书签数量: ${download.data.bookmarks.length}`)
                } else {
                    setDownloadedData(null)
                }
                if (download.error) results.push(`错误: ${download.error}`)
            } else {
                const config = userConfig?.webDavConfigs?.[selectedWebDAVIndex]
                if (!config) {
                    results.push("❌ 没有选中的 WebDAV 配置")
                    setTestResult(results.join("\n"))
                    return
                }

                results.push("=== 测试 WebDAV download ===\n")
                const provider = WebDAVRegistry.createProvider(config.vendorId || "jianguoyun", config)
                const download = await provider.download()

                results.push(`状态: ${download.success ? "✅ 成功" : "❌ 失败"}`)
                if (download.data) {
                    setDownloadedData(download.data)
                    results.push(`\n数据:`)
                    results.push(`  更新时间: ${new Date(download.data.updatedAt).toLocaleString()}`)
                    results.push(`  书签数量: ${download.data.bookmarks.length}`)
                } else {
                    setDownloadedData(null)
                }
                if (download.error) results.push(`错误: ${download.error}`)
            }
        } catch (e) {
            results.push(`❌ 错误: ${e}`)
        }

        setTestResult(results.join("\n"))
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">CloudLeaf 测试面板</h1>
                    <p className="text-gray-600 mt-2">配置管理 + 功能测试</p>
                </header>

                <div className="grid grid-cols-3 gap-6">
                    {/* 左侧：配置视图 */}
                    <div className="col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow sticky top-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">当前配置</h3>
                                <button onClick={loadConfig} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
                                    🔄 刷新
                                </button>
                            </div>

                            {userConfig && (
                                <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-[600px] whitespace-pre-wrap font-mono">
                                    {JSON.stringify(userConfig, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>

                    {/* 右侧：主要内容 */}
                    <div className="col-span-2 space-y-6">
                        {/* ========== 第一部分：配置 CRUD ========== */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-lg border-2 border-purple-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 第一部分：配置管理（CRUD）</h2>

                            {/* 预置云厂商（只读） */}
                            <div className="bg-white p-6 rounded-lg shadow mb-6">
                                <h3 className="font-semibold text-gray-700 mb-4">预置云厂商（只读）</h3>
                                <div className="space-y-2">
                                    {WebDAVRegistry.getPresetVendors().map(vendor => (
                                        <div key={vendor.id} className="p-3 bg-gray-100 rounded border border-gray-300">
                                            <p className="font-medium text-sm">{vendor.name}</p>
                                            <p className="text-xs text-gray-500">{vendor.serverUrl}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 自定义云厂商（CRUD） */}
                            <div className="bg-white p-6 rounded-lg shadow mb-6">
                                <h3 className="font-semibold text-gray-700 mb-4">自定义云厂商（可 CRUD）</h3>
                                <div className="space-y-3 mb-4">
                                    <input type="text" placeholder="云厂商 ID" value={customVendorForm.id} onChange={(e) => setCustomVendorForm({ ...customVendorForm, id: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <input type="text" placeholder="云厂商名称" value={customVendorForm.name} onChange={(e) => setCustomVendorForm({ ...customVendorForm, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <input type="text" placeholder="服务器地址" value={customVendorForm.serverUrl} onChange={(e) => setCustomVendorForm({ ...customVendorForm, serverUrl: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium text-gray-600 mb-2">账号信息</p>
                                        <div className="space-y-3">
                                            <input type="text" placeholder="用户名" value={customVendorForm.username} onChange={(e) => setCustomVendorForm({ ...customVendorForm, username: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                            <input type="password" placeholder="密码" value={customVendorForm.password} onChange={(e) => setCustomVendorForm({ ...customVendorForm, password: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                            <input type="text" placeholder="文件路径" value={customVendorForm.filePath} onChange={(e) => setCustomVendorForm({ ...customVendorForm, filePath: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                        </div>
                                    </div>
                                    <button onClick={addCustomVendor} className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium">
                                        ➕ 添加自定义云厂商（含账号）
                                    </button>
                                </div>

                                {/* 已保存的自定义云厂商 */}
                                {userConfig?.customVendors && userConfig.customVendors.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">已保存 ({userConfig.customVendors.length})</h4>
                                        <div className="space-y-2">
                                            {userConfig.customVendors.map((vendor) => (
                                                <div key={vendor.id} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{vendor.name}</p>
                                                        <p className="text-xs text-gray-500">{vendor.serverUrl}</p>
                                                    </div>
                                                    <button onClick={() => deleteCustomVendor(vendor.id)} className="text-red-500 hover:text-red-700 text-sm px-3 py-1">
                                                        🗑️ 删除
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 用户账号配置（CRUD） */}
                            <div className="bg-white p-6 rounded-lg shadow mb-6">
                                <h3 className="font-semibold text-gray-700 mb-4">WebDAV 用户账号（可 CRUD）</h3>
                                <div className="space-y-3 mb-4">
                                    <select value={accountForm.vendorId} onChange={(e) => setAccountForm({ ...accountForm, vendorId: e.target.value })} className="w-full px-3 py-2 border rounded">
                                        <optgroup label="预置云厂商">
                                            {WebDAVRegistry.getPresetVendors().map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </optgroup>
                                        {WebDAVRegistry.getCustomVendors().length > 0 && (
                                            <optgroup label="自定义云厂商">
                                                {WebDAVRegistry.getCustomVendors().map(v => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                    <input type="text" placeholder="用户名" value={accountForm.username} onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <input type="password" placeholder="密码" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <input type="text" placeholder="文件路径" value={accountForm.filePath} onChange={(e) => setAccountForm({ ...accountForm, filePath: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <button onClick={addWebDAVAccount} className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium">
                                        ➕ 添加账号
                                    </button>
                                </div>

                                {/* 已保存的账号 */}
                                {userConfig?.webDavConfigs && userConfig.webDavConfigs.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">已保存 ({userConfig.webDavConfigs.length})</h4>
                                        <div className="space-y-2">
                                            {userConfig.webDavConfigs.map((config, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{config.vendorId} - {config.username}</p>
                                                        <p className="text-xs text-gray-500">{config.filePath}</p>
                                                    </div>
                                                    <button onClick={() => deleteWebDAVAccount(index)} className="text-red-500 hover:text-red-700 text-sm px-3 py-1">
                                                        🗑️ 删除
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gist 配置 */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-semibold text-gray-700 mb-4">Gist 配置</h3>
                                <div className="space-y-3">
                                    <input type="text" placeholder="GitHub Access Token" value={gistForm.accessToken} onChange={(e) => setGistForm({ ...gistForm, accessToken: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <input type="text" placeholder="Gist ID" value={gistForm.gistId} onChange={(e) => setGistForm({ ...gistForm, gistId: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <input type="text" placeholder="文件名" value={gistForm.fileName} onChange={(e) => setGistForm({ ...gistForm, fileName: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    <button onClick={saveGistConfig} className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium">
                                        💾 保存 Gist 配置
                                    </button>
                                </div>

                                {/* 已保存的 Gist */}
                                {userConfig?.gist && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">Gist: {userConfig.gist.gistId}</p>
                                                <p className="text-xs text-gray-500">{userConfig.gist.fileName}</p>
                                            </div>
                                            <button onClick={deleteGistConfig} className="text-red-500 hover:text-red-700 text-sm px-3 py-1">
                                                🗑️ 删除
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ========== 第二部分：功能测试 ========== */}
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg shadow-lg border-2 border-green-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">🧪 第二部分：功能测试</h2>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-semibold text-gray-700 mb-4">选择要测试的配置</h3>

                                {/* 配置类型选择 */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">配置类型</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input type="radio" checked={selectedConfigType === "webdav"} onChange={() => setSelectedConfigType("webdav")} className="mr-2" />
                                            WebDAV
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" checked={selectedConfigType === "gist"} onChange={() => setSelectedConfigType("gist")} className="mr-2" />
                                            Gist
                                        </label>
                                    </div>
                                </div>

                                {/* WebDAV 配置选择 */}
                                {selectedConfigType === "webdav" && userConfig?.webDavConfigs && userConfig.webDavConfigs.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">选择配置</label>
                                        <select
                                            value={selectedWebDAVIndex}
                                            onChange={(e) => setSelectedWebDAVIndex(Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                        >
                                            {userConfig.webDavConfigs.map((config, index) => (
                                                <option key={index} value={index}>
                                                    #{index + 1} - {config.vendorId} ({config.username}) - {config.filePath}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* 测试按钮 */}
                                <div className="grid grid-cols-3 gap-3 mt-6">
                                    <button onClick={testIsValid} className="py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
                                        ✓ isValid
                                    </button>
                                    <button onClick={testUpload} className="py-3 bg-green-500 text-white rounded hover:bg-green-600 font-medium">
                                        ↑ Upload
                                    </button>
                                    <button onClick={testDownload} className="py-3 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium">
                                        ↓ Download
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 下载数据展示 */}
                        {downloadedData && (
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-semibold text-gray-700 mb-4">📥 下载的数据</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">更新时间: {new Date(downloadedData.updatedAt).toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">书签数量: {downloadedData.bookmarks.length}</p>
                                </div>
                                <div className="space-y-2 max-h-96 overflow-auto">
                                    {downloadedData.bookmarks.map((bookmark: any, index: number) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded border">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{bookmark.title}</p>
                                                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                        {bookmark.url}
                                                    </a>
                                                </div>
                                                <span className="text-xs text-gray-400 ml-2">#{index + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 测试结果 */}
                        {testResult && (
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="font-semibold text-gray-700 mb-4">测试结果</h3>
                                <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                                    {testResult}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestPage
