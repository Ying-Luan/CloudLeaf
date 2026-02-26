<div align="center">

<img src="assets/icon.png" alt="CloudLeaf" width="128" height="128">

# CloudLeaf

**Browser Bookmark Cloud Sync Extension**

![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/knpkebnhpcbklnknkcpgkiochlimhcoi)
![Chrome Web Store Size](https://img.shields.io/chrome-web-store/size/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[![Plasmo](https://img.shields.io/badge/Built%20with-Plasmo-blue)](https://docs.plasmo.com/)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/635543f1c45042b191b09831fb6ff3b8)](https://app.codacy.com/gh/Ying-Luan/CloudLeaf/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

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
| Jianguoyun          | WebDAV   | Supported |
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
