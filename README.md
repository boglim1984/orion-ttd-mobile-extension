# Orion TTD Mobile Extension

This is the real TTD Mobile Extension shell.

- Chrome-style WebExtension is canonical.
- Orion iOS is the source-of-truth runtime.
- GitHub Pages update loop is canonical.
- Bookmarklet remains fallback.
- Safari Web Inspector is the debugger.
- v0.1.0 does not perform composer insertion.
- v0.1.0 does not perform submit behavior.

## Layout

- `src/`: manifest and content-script templates
- `scripts/`: build, package, and verification scripts
- `dist/`: built extension artifacts
- `updates/`: Chrome update metadata
- `reports/`: local run/report artifacts

## v0.1.0 behavior

The content script only runs on ChatGPT pages and exposes:

- `window.__ORION_TTD_BUILD__`
- `window.__ORION_TTD_INFO__`
- `window.__ORION_TTD_SMOKE__()`

Console output:

```text
[ORION TTD MOBILE] version=0.1.0 flavor=chrome
```

## Canonical update channel

- Public repo: `https://github.com/boglim1984/orion-ttd-mobile-extension`
- GitHub Pages base: `https://boglim1984.github.io/orion-ttd-mobile-extension/`
- Chrome update XML: `https://boglim1984.github.io/orion-ttd-mobile-extension/updates/chrome-updates.xml`

## Build and package

Run from this folder:

```bash
node scripts/build-ttd-mobile-extension.mjs
node scripts/package-ttd-mobile-extension.mjs
node scripts/verify-ttd-mobile-extension.mjs
```

## Billy v0.1.0 test flow

1. Install or update the Chrome-style package from the iPhone-local Orion extension path.
2. Open `https://chatgpt.com/` in Orion iOS.
3. Attach Safari Web Inspector from the Mac.
4. Run:

```javascript
window.__ORION_TTD_BUILD__
window.__ORION_TTD_INFO__
window.__ORION_TTD_SMOKE__()
```

Expected results:

- build returns `"0.1.0"`
- `info.flavor` returns `"chrome"`
- smoke returns the same info object
- no composer insertion occurs
- no submit occurs
