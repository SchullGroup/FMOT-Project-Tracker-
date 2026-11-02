# FMoT Rail Project Tracker: working folder

Working folder for the Federal Ministry of Transportation rail project tracker (Schull Technologies). Drop this into your project directory (or use it as the root of a new repository). Claude Code reads `CLAUDE.md` automatically and the docs on request.

## Layout

```
fmot-rail-tracker/
  CLAUDE.md               project brief, Penpot conventions, wireframe status
  README.md
  docs/
    screen-map.md         every screen, its contents, who sees it, and the button map by operation
    process-model.md      gates, roles, rules enforced in code, project creation, platform clients
  design/
    penpot.md             where the Penpot file lives and how it is organised
```

## Living documents

- Claude doc (full scrapbook, edited as we go): https://claude.ai/artifact/VVPX6yfqWK5aVhqshwH4Tx
- Google Doc (earlier working copy): https://docs.google.com/document/d/1GWRs-Zo9aYylnKluQeY_cNgCvJIYxCljkwpwzrCTHlI/edit

When the scrapbook changes, re-export the Screen map tab as Markdown over `docs/screen-map.md` so Claude Code works from the current version.

## Next steps

1. Finish the wireframes on pages 03 to 06 (see the status table in `CLAUDE.md`).
2. Start the design-system file in Penpot: token sets and themes first, then library colours and typographies, icons, atoms.
3. Replace the raw-SVG text on the first two boards with native text once typography tokens exist.
