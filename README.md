# Underscore Title

Underscore Title is an Obsidian 1.13+ plugin that changes how files and folders are displayed without renaming anything.

It resolves a display title in this order:

1. Markdown file frontmatter title, using the configured key. Default: `title`
2. Text after the configured delimiter in the file or folder name. Default: `__`
3. The original file or folder name

For example, `20260619__Meeting note.md` is shown as `Meeting note`. If the file also has `title: Weekly sync`, it is shown as `Weekly sync`.

## Features

- File explorer display titles for files and folders
- Graph and local graph display titles
- Markdown tab display titles
- Explorer sorting by original filename or displayed title
- Configurable delimiter and frontmatter title key
- Include and ignore path rules with simple glob patterns
- Settings preview for title resolution
- English and Korean settings text, with automatic locale detection

Search, Suggest, Alias, Backlinks, Bookmarks, and Canvas support are planned follow-up scopes. The first implementation focuses on Explorer, Graph, and Tabs.

## Path Rules

Rules are written one per line.

- Empty include rules mean every path is included.
- If include rules are present, at least one include rule must match.
- Ignore rules always win.

Examples:

```text
Projects/**
Areas/*/Notes/**
```

## Privacy

This plugin does not rename files, does not write frontmatter, does not use telemetry, and does not make network requests. It reads Obsidian metadata cache and vault paths to compute display-only titles.

## Development

```bash
pnpm install
pnpm run check
```

The release check verifies the expected release artifacts and manifest/version consistency. Build output is generated as `main.js`.

## Manual QA Before Release

1. Install the plugin folder into a test vault under `.obsidian/plugins/underscore-title`.
2. Enable the plugin in Obsidian 1.13+.
3. Confirm settings render and are searchable.
4. Try `20260619__Meeting note.md` and a folder named `01__Projects`.
5. Add `title: Weekly sync` to the file and confirm it overrides the delimiter title.
6. Toggle Explorer, Graph, and Tabs scopes.
7. Toggle Explorer sorting between original filename and displayed title.
8. Add include and ignore rules and confirm ignored paths keep original titles.
