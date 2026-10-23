# VioTrack System Requirements

| Requirement | Recommendation |
|---|---|
| Operating system | Ubuntu Server 24.04 LTS for a mature setup, or 26.04 LTS for the newest LTS |
| Architecture | 64-bit |
| CPU | 4 vCPUs to start |
| Memory | 8–16 GB RAM |
| Storage | 100 GB SSD, with room for database growth, uploads, and backups |
| Runtime | Node.js 24 LTS |
| Database | MySQL |
| LanguageTool | Java 17+ if self-hosted |
| Network/security | HTTPS, database kept private, persistent storage for uploads, regular backups |
| Production mode | Build the frontend and run the API as a service; `npm run dev` is for development |
| Ubuntu note | Update the Java classpath separator in `package.json` before using its LanguageTool script on Linux |

The CPU, memory, and storage figures are practical starting estimates. Actual requirements depend on concurrent users, database growth, file uploads, and whether LanguageTool runs on the same server.

## References

- [Ubuntu release lifecycle](https://ubuntu.com/project/docs/release-team/list-of-releases/)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [LanguageTool Java requirements](https://dev.languagetool.org/java-api)
