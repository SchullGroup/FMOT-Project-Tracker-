# Penpot

- Server: http://localhost:9001 (self-hosted, Penpot 2.18, Docker Compose in `penpot_server/`).
- MCP: the in-app MCP server, added to Claude Code as `penpot` (`claude mcp add --transport http penpot "<stream URL with your user token>"`). The user token is a credential; keep it out of files and chats, and regenerate it from the MCP panel if it leaks.
- Team "Schulltech Team" > project "FMoT Rail Project Tracker" > file "Wireframes".
- Pages: 01 Web Map home, 02 Web Project view, 03 Web Create project, 04 Web Tasks, 05 Setup, 06 Mobile.
- Boards: `screens/<id>` from `docs/screen-map.md`; desktop 1440x1024, phone 390x844; 100 px gutters.
- The design system will be a second file consumed as a shared library; build order is tokens, library colours and typographies, icons, atoms, molecules, organisms, templates, screens.
