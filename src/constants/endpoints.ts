/**
 * GitHub Gist API endpoint constants
 * @readonly
 */
export const GIST_ENDPOINTS = {
    // Base URL for GitHub API requests
    BASE_URL: "https://api.github.com",
    // Path for Gist CRUD operations
    GIST_PATH: "/gists",
    // Path for validating access token,
    USER_PATH: "/user",
} as const
