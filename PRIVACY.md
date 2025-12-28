# Privacy Policy

*Last updated: December 2025*

## Overview

CloudLeaf is a browser extension that helps you sync bookmarks across devices. **We do not collect, store, or transmit any of your data to our servers.**

## Data Storage

All data is stored locally in your browser using `chrome.storage.local`:
- Configuration settings
- Access tokens and credentials
- Sync preferences

## Third-Party Services

CloudLeaf can sync your bookmarks to third-party services **only when you explicitly configure them**:

- **GitHub Gist** - Your bookmarks are sent to GitHub using your personal access token
- **WebDAV Services** - Your bookmarks are sent to your configured WebDAV server

We do not have access to your credentials or synced data. All communication happens directly between your browser and the service you configure.

## Permissions

| Permission  | Purpose                          |
| ----------- | -------------------------------- |
| `bookmarks` | Read and write browser bookmarks |
| `storage`   | Store configuration locally      |

## Data Collection

**We collect no data.** Specifically:
- No analytics or tracking
- No telemetry
- No crash reports sent to us
- No personal information collected

## Contact

If you have questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/Ying-Luan/CloudLeaf).
