# TTD Mobile Extension v0.1.0 Scaffold Report

## Executive summary

Scaffolded the first real Orion-first TTD Mobile Extension shell as a harmless Chrome-style WebExtension. The `v0.1.0` build exposes visible build-stamp globals, logs its build line in the page console, packages as a Chrome-style zip, and generates Chrome update XML for the canonical Orion iOS GitHub Pages update loop. No composer insertion, submit behavior, state machine logic, session inspection, or hidden automation was added.

## Files created/changed

- `ttd-mobile-extension/README.md`
- `ttd-mobile-extension/src/manifest.chrome.json`
- `ttd-mobile-extension/src/content.js`
- `ttd-mobile-extension/scripts/build-ttd-mobile-extension.mjs`
- `ttd-mobile-extension/scripts/package-ttd-mobile-extension.mjs`
- `ttd-mobile-extension/scripts/verify-ttd-mobile-extension.mjs`
- `ttd-mobile-extension/dist/v0.1.0/build-info.json`
- `ttd-mobile-extension/dist/v0.1.0/chrome-ext/manifest.json`
- `ttd-mobile-extension/dist/v0.1.0/chrome-ext/content.js`
- `ttd-mobile-extension/dist/v0.1.0/orion-ttd-mobile-extension-chrome-v0.1.0.zip`
- `ttd-mobile-extension/updates/chrome-updates.xml`
- `ttd-mobile-extension/reports/ttd-mobile-extension-v0.1.0-verify.json`
- `ttd-mobile-extension/reports/ttd-mobile-extension-v0.1.0-scaffold-report.md`

## Public repo / Pages URL

- Public repo: `https://github.com/boglim1984/orion-ttd-mobile-extension`
- GitHub Pages base: `https://boglim1984.github.io/orion-ttd-mobile-extension/`

## Chrome update metadata URL

- `https://boglim1984.github.io/orion-ttd-mobile-extension/updates/chrome-updates.xml`

## Package artifact URL

- `https://boglim1984.github.io/orion-ttd-mobile-extension/dist/v0.1.0/orion-ttd-mobile-extension-chrome-v0.1.0.zip`

## Build stamp globals

- `window.__ORION_TTD_BUILD__ === "0.1.0"`
- `window.__ORION_TTD_INFO__`
- `window.__ORION_TTD_SMOKE__()`

Expected info object shape:

```javascript
{
  name: "Orion TTD Mobile Extension",
  version: "0.1.0",
  flavor: "chrome",
  channel: "orion-ios-github-pages-update",
  updatedAt: "<ISO timestamp>",
  purpose: "real TTD mobile extension shell; no composer insertion yet"
}
```

Console line:

```text
[ORION TTD MOBILE] version=0.1.0 flavor=chrome
```

## Exact Billy install/update test steps

1. Download or update the Chrome `v0.1.0` package through the iPhone-local Orion extension path.
2. Open `https://chatgpt.com/` in Orion iOS.
3. Attach Safari Web Inspector from the Mac to the live Orion iPhone tab.
4. Run:

```javascript
window.__ORION_TTD_BUILD__
window.__ORION_TTD_INFO__
window.__ORION_TTD_SMOKE__()
```

Expected:

- build returns `"0.1.0"`
- `info.flavor` returns `"chrome"`
- smoke returns the same info object
- no composer insertion occurs
- no submit occurs

## Pass/fail criteria

Pass:

- Orion accepts the package.
- Content script runs on ChatGPT.
- Safari Web Inspector sees the build stamp.
- Smoke function returns the `v0.1.0` info object.
- No composer insertion occurs.
- No submit occurs.

Fail:

- Orion rejects the package.
- Content script does not run.
- Build stamp is missing.
- Update metadata is missing or points to the wrong version.
- The package includes unsafe permissions or behavior.

## What was intentionally not implemented

- Composer insertion
- Submit behavior
- State machine/runtime logic
- Local/session/auth storage inspection
- Background/service worker logic
- Any hidden automation

## Next recommended version

`v0.2.0` should add the shared composer-injector smoke function in insert-only mode, with submit disabled by default.
