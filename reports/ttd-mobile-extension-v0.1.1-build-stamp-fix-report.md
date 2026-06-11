# TTD Mobile Extension v0.1.1 Build Stamp Fix Report

## Executive summary

Built and packaged `v0.1.1` of the Orion TTD Mobile Extension as a narrow visibility fix. The content script still logs its Chrome-channel build line, but the official verification path now uses page-visible DOM dataset attributes on `document.documentElement` so Safari Web Inspector can read the build stamp from the normal page console.

## Why v0.1.1 was needed

`v0.1.0` installed and ran in Orion iOS, and Billy confirmed the console line appeared. But the prior verification method depended on `window.__ORION_TTD_*` globals from the content-script context, which were not visible from the normal page console. `v0.1.1` keeps the extension harmless and fixes only the visibility mechanism by writing build metadata to DOM dataset attributes.

## Files changed

- `README.md`
- `src/content.js`
- `scripts/build-ttd-mobile-extension.mjs`
- `scripts/package-ttd-mobile-extension.mjs`
- `scripts/verify-ttd-mobile-extension.mjs`
- `dist/v0.1.1/build-info.json`
- `dist/v0.1.1/chrome-ext/content.js`
- `dist/v0.1.1/chrome-ext/manifest.json`
- `dist/v0.1.1/orion-ttd-mobile-extension-chrome-v0.1.1.zip`
- `updates/chrome-updates.xml`
- `reports/ttd-mobile-extension-v0.1.1-verify.json`
- `reports/ttd-mobile-extension-v0.1.1-build-stamp-fix-report.md`

## Version/update metadata changed

- Extension version bumped from `0.1.0` to `0.1.1`
- Manifest version now reads `0.1.1`
- Build output now writes DOM dataset build stamps for `0.1.1`
- Chrome update XML now points to the `v0.1.1` package URL
- Verification output now records the `v0.1.1` artifact and checks

## Public package URL

- `https://boglim1984.github.io/orion-ttd-mobile-extension/dist/v0.1.1/orion-ttd-mobile-extension-chrome-v0.1.1.zip`

## Chrome update XML URL

- `https://boglim1984.github.io/orion-ttd-mobile-extension/updates/chrome-updates.xml`

## Safety verification

Verified locally that `v0.1.1`:

- contains `manifest.json` and `content.js` at the zip root
- contains manifest version `0.1.1`
- contains the required DOM dataset stamp writes
- does not contain composer insertion logic
- does not contain send-button click logic
- does not read `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`, `navigator.credentials`, or `chrome.storage`

## Billy update steps

1. Open Orion iOS Extensions.
2. Tap `Update` for the installed Orion TTD Mobile Extension.
3. Open or refresh `https://chatgpt.com/`.
4. Attach Safari Web Inspector from the Mac.
5. Run the verification commands below.

## Safari Web Inspector verification commands

```javascript
document.documentElement.dataset.orionTtdBuild
document.documentElement.dataset.orionTtdFlavor
document.documentElement.dataset.orionTtdChannel
document.documentElement.dataset.orionTtdLoaded
document.documentElement.dataset.orionTtdInfo
```

Expected:

- build returns `"0.1.1"`
- flavor returns `"chrome"`
- channel returns `"orion-ios-github-pages-update"`
- loaded returns `"true"`
- info contains version `"0.1.1"` and flavor `"chrome"`

Console should also show:

```text
[ORION TTD MOBILE] version=0.1.1 flavor=chrome
```

## Pass/fail criteria

Pass:

- Orion Update moves the extension to `v0.1.1`
- console shows `[ORION TTD MOBILE] version=0.1.1 flavor=chrome`
- DOM dataset commands return the expected `v0.1.1` values
- no composer insertion occurs
- no submit occurs

Fail:

- Orion Update does not fetch `v0.1.1`
- console still shows `v0.1.0` after update/reload
- DOM dataset values are absent
- the package includes unsafe behavior

## Next recommended version

`v0.2.0` should add the shared composer-injector smoke function in insert-only mode, with submit disabled by default.
