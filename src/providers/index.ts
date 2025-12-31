/**
 * Providers module
 * @module providers
 * @remarks Provider hierarchy: BaseProvider -> HttpProvider -> GistProvider/WebDAVProvider; LocalProvider
 * @packageDocumentation
 */

// L1: Contract layer
export * from "./base"

// L2: HTTP protocol and local storage layer
export * from "./http"
export * from "./local"

// L3: Concrete implementations
export * from './gist'
export * from "./webdav"

