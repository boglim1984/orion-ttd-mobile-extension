# Orion TTD Milestone 7 Insert-Only Smoke

Status: implementation and local harness artifact  
Scope: visible composer insertion only, no submit behavior

## Purpose

Prove that the Orion extension can prepare a lawful deterministic `TTD_COMMAND_V1`-shaped packet and insert it into a ChatGPT composer surface as visible user-reviewable text.

## Hard Boundary

- insert only
- no automatic submit
- no click-send path
- no hidden state authority
- no silent route mutation
- no secrets, cookies, tokens, or private account reads

## Runtime Shape

Milestone 7 adds:

- a deterministic insert-only packet builder
- composer discovery for textarea and contenteditable candidates
- input/change event dispatch so the page notices inserted text
- a manual trigger path via:
  - `window.__ORION_TTD_INSERT_ONLY_SMOKE__()` in content-script context
  - `document.dispatchEvent(new CustomEvent("orion-ttd-run-insert-only-smoke"))` at the page DOM boundary

## Default Safety Rule

The smoke refuses to overwrite a non-empty composer by default. Billy should use an empty draft for the real test unless an explicit overwrite option is added later.

## Packet Marker

The inserted text begins with:

```text
TTD_ORION_POC_V1
```

and carries an insert-only `TTD_COMMAND_V1` payload with:

- `packet_type: "orion_insert_only_smoke"`
- `mode: "insert_only_no_submit"`
- `legal_boundary: "composer_insert_only_user_review_required"`

## Local Test Surfaces

- `test-fixtures/composer/test-page.html`
- `test-fixtures/composer/insert-only-smoke.mjs`
- `test/content/insert-only-smoke.test.js`
- `test/content/packet-builder.test.js`

## Manual Orion iPhone Steps

1. Plug iPhone into Mac.
2. Open Orion on iPhone.
3. Open the ChatGPT page in Orion.
4. Open Safari Web Inspector for that Orion page on Mac.
5. Confirm the extension loaded:
   `document.documentElement.dataset.orionTtdInsertOnlyReady`
6. Make sure the composer is empty.
7. Trigger the smoke:
   `document.dispatchEvent(new CustomEvent("orion-ttd-run-insert-only-smoke"))`
8. Verify the composer now contains the `TTD_ORION_POC_V1` packet.
9. Do not press send.
10. Inspect:
   `document.documentElement.dataset.orionTtdInsertOnlyLastResult`

## What To Inspect In Web Inspector

- `document.documentElement.dataset.orionTtdBuild`
- `document.documentElement.dataset.orionTtdLoaded`
- `document.documentElement.dataset.orionTtdInsertOnlyReady`
- `document.documentElement.dataset.orionTtdInsertOnlyLastResult`
- console errors about missing composer selectors or blocked overwrite

## Rollback / Disable

- remove or revert the Milestone 7 content-script modules
- revert the custom event listener and `__ORION_TTD_INSERT_ONLY_SMOKE__` hook
- rebuild/package so the extension returns to build-stamp-only behavior

## Known Risks

- Orion iOS isolated worlds may expose content-script globals differently than the page world
- ChatGPT can change composer markup and break selector priority
- iOS focus/input event quirks may require clicking into the composer before triggering insertion
- page-world and content-script-world state are still separated, so DOM event bridging remains the safe trigger path
