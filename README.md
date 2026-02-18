<div align="center">

<img src="assets/icon.png" alt="CloudLeaf" width="128" height="128">

# CloudLeaf

**Browser Bookmark Cloud Sync Extension**

[![Plasmo](https://img.shields.io/badge/Built%20with-Plasmo-blue)](https://docs.plasmo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FYing-Luan%2FCloudLeaf.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FYing-Luan%2FCloudLeaf?ref=badge_shield)

[English](README.md) | [中文](README_zh.md)

</div>

---

## Features

- **Upload to GitHub Gist** - Sync bookmarks to your private Gist
- **Upload via WebDAV** - Sync bookmarks to any WebDAV-compatible cloud storage (Jianguoyun, etc.)
- **Export to Local File** - Download bookmarks as JSON file
- **Import from Cloud/Local** - Restore bookmarks from Gist, WebDAV, or local file
- **Conflict Detection** - Prevent accidental overwrites when cloud is newer
- **Preview Mode** - View cloud bookmarks before importing

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev         # For Chrome
npm run dev:edge    # For Microsoft Edge

# Build for production
npm run build       # For Chrome
npm run build:edge  # For Microsoft Edge

# Package for store
npm run package       # For Chrome
npm run package:edge  # For Microsoft Edge
```

## Supported Providers

| Provider            | Protocol | Status    |
| ------------------- | -------- | --------- |
| GitHub Gist         | REST API | Supported |
| Jianguoyun (坚果云) | WebDAV   | Supported |
| Custom WebDAV       | WebDAV   | Supported |

## Configuration

### GitHub Gist
1. Create a GitHub [Personal Access Token](https://github.com/settings/tokens) with `gist` scope
2. Create a new Gist (can be private)
3. Enter your token and Gist ID in the extension settings

### WebDAV (Jianguoyun)
1. Go to Jianguoyun → Account Info → Security Options → Third-party Apps
2. Add a new app to get the **app password** (not your login password)
3. Enter your email and app password in the extension settings


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FYing-Luan%2FCloudLeaf.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FYing-Luan%2FCloudLeaf?ref=badge_large)