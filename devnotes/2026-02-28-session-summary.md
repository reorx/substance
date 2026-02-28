refactor: complete common markdown module migration and finish webext extractor flow

Session summary (2026-02-28)

Background and inferred original goal
- This repo had long-lived uncommitted work that was midway through a migration.
- The core intention was to move markdown editing/viewing utilities from `pkgs/web` into `pkgs/common`, then reuse them in both web and browser extension flows.
- The repo was also in the middle of package manager migration (`npm` -> `pnpm`) with lockfile and dependency layout changes.

What was completed in this session

1) Completed migration usage in web extractor page
- Switched `pkgs/web/src/pages/Extractor/index.tsx` to consume shared components/state from `@substance/common`:
  - `MarkdownEditor`
  - `MarkdownViewer`
  - `useMarkdownStore`
- Removed direct dependency on local `Editor/Viewer/useStore` wiring for page rendering state.
- Kept existing extractor page UX and option controls, but state writes now go to shared markdown store.

2) Finished web extension extractor page and runtime flow
- Implemented actual extraction logic in `pkgs/webext/src/extractor.tsx`:
  - Listen for `MsgType.ExtractCurrentPage1` messages.
  - Run `ExtractManager(WikipediaExtractor)` on received `{url, html}`.
  - Store extracted markdown/title/extraData into shared `useMarkdownStore`.
  - Return success/error via `sendResponse`.
- Replaced placeholder page content with a full editor/viewer 2-column layout using shared common components.
- Added initial empty-state hint text when no extracted markdown is present yet.

3) Shared/common extractor compatibility and test stability
- Updated utility import path in `pkgs/common/src/extract.ts` from removed `./utils.ts` to split util module path `./utils/string`.
- Adjusted cheerio-related type aliases in:
  - `pkgs/common/src/extract.ts`
  - `pkgs/common/src/extractors/wikipedia.ts`
  to keep TS compatibility with current dependency resolution.
- Added markdown normalization in `pkgs/common/src/extract.ts` to keep historical outputs stable across dependency versions:
  - normalize escaped parentheses `\\(` and `\\)` back to `(` and `)`.
- Result: common extractor tests pass again without rewriting stored expected markdown fixtures.

4) Build compatibility fixes for updated dependency graph
- Added missing babel plugin dependency for current webpack/babel build pipeline:
  - `@emotion/babel-plugin`
- Added `punycode` package and webpack resolve fallback in both:
  - `pkgs/web/webpack.config.js`
  - `pkgs/webext/webpack.config.js`
  to resolve browser bundling errors introduced by current `markdown-it` dependency behavior.

5) Existing migration changes included in this commit
- `pkgs/common` now carries shared markdown/editor/viewer implementation and split utils (`components/`, `markdown.ts`, `utils/*`).
- Legacy `pkgs/common/src/utils.ts` removed in favor of modularized util files.
- Package/lock/config updates from previous in-progress work are preserved and committed together:
  - `.npmrc` deletion and `bak.npmrc`
  - `package-lock.json` deletion
  - `pnpm-lock.yaml` updates
  - `tsconfig.base.json` update (`jsx: react-jsx`)
  - package dependency adjustments in root/common/web

Validation executed
- `pnpm --filter @substance/common test` => PASS (10/10)
- `pnpm -r build` => PASS for workspace packages (`common`, `web`, `webext`)
- Remaining output contains non-blocking warnings only:
  - sass legacy JS API deprecation warnings
  - sass `@import` deprecation warning in existing stylesheet
  - bundle size/performance warnings

Notes
- This commit intentionally includes all current tracked/untracked changes in workspace as requested.
- Session report is stored in `devnotes/2026-02-28-session-summary.md` and used verbatim as commit message via `git commit -F`.
