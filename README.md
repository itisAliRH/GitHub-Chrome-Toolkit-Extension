# GitHub Chrome Toolkit Extension

A Chrome MV3 extension that adds quality-of-life features to GitHub — directly on the page, no popups.

## Features

### Notification filtering

On `github.com/notifications`, a filter bar appears above your notification list with four status pills:

| Pill   | Matches             |
| ------ | ------------------- |
| Open   | Open PRs / issues   |
| Merged | Merged PRs          |
| Closed | Closed PRs / issues |
| Muted  | Muted threads       |

Click a pill to show only that status; click again to clear. The filter is non-destructive — hidden items are just `display:none`.

### Open in tabs

The same filter bar includes two bulk-open buttons:

- **Open Selected** — opens a new tab for every notification whose GitHub checkbox is ticked
- **Open All Visible** — opens a new tab for every notification currently shown (respects the active filter)

Links prefer the PR/issue/commit URL over the thread URL.

### Delete branch shortcut

On any merged or closed PR page (`github.com/:owner/:repo/pull/:number`), a **🗑 Delete branch** button appears next to the status badge in the PR header. Clicking it triggers GitHub's own delete-branch action and removes itself — no page scroll, no extra clicks.

## Installation

> The extension is not published to the Chrome Web Store. Load it as an unpacked extension.

1. Clone the repo and install dependencies:

   ```sh
   git clone <repo-url>
   cd github-notifications
   npm install
   ```

2. Build:

   ```sh
   npm run build
   ```

3. Open Chrome and go to `chrome://extensions`.
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select this repository's root folder.
6. Navigate to `github.com/notifications` or any PR page to see the extension in action.

### Development

```sh
npm run watch      # rebuild on file changes
npm run typecheck  # type-check without emitting
npm run test       # run tests with vitest
```

## Project structure

```
src/
  notifications/
    classifier.ts     # classifies each notification item by status
    filter-bar.ts     # renders the filter + open-tabs toolbar
    tabs.ts           # collects URLs and sends OPEN_TABS message
    index.ts          # content script entry — wires SPA navigation
  pull-request/
    detector.ts       # reads the PR status badge (merged / closed / open)
    delete-button.ts  # creates and inserts the shortcut button
    index.ts          # content script entry — waits for async merge box
  shared/
    dom-utils.ts      # waitForElement, onSPANavigate helpers
  service-worker.ts   # background worker — handles OPEN_TABS → chrome.tabs.create
dist/                 # esbuild output (gitignored)
```

## Tech

- TypeScript, built with [esbuild](https://esbuild.github.io/) (single-file bundles — required for Chrome MV3 content scripts)
- Tests with [Vitest](https://vitest.dev/) + jsdom
- No runtime dependencies
