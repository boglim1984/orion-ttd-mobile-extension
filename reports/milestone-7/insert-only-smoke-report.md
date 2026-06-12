# Milestone 7 Insert-Only Smoke Report

## Status

Implemented locally as an insert-only command packet smoke for the Orion extension. Phone-side update validation passed, but manual Web Inspector insertion validation remains pending.

## Files Added Or Changed

- `src/content/packet-builder.js`
- `src/content/composer-finder.js`
- `src/content/orion-ttd-insert-only.js`
- `src/content.js`
- `src/manifest.chrome.json`
- `scripts/build-ttd-mobile-extension.mjs`
- `scripts/package-ttd-mobile-extension.mjs`
- `scripts/verify-ttd-mobile-extension.mjs`
- `test/content/packet-builder.test.js`
- `test/content/insert-only-smoke.test.js`
- `test-fixtures/composer/test-page.html`
- `test-fixtures/composer/insert-only-smoke.mjs`
- `test-fixtures/composer/selector-notes.md`
- `docs/ORION_TTD_MILESTONE_7_INSERT_ONLY_SMOKE.md`

## What Was Implemented

- deterministic `TTD_COMMAND_V1`-shaped insert-only packet builder
- textarea/contenteditable composer discovery
- input/change event dispatch after insertion
- overwrite protection for non-empty drafts
- explicit no-submit boundary
- DOM-event trigger path for Orion iOS manual testing

## Local Validation Goal

- packet text starts with `TTD_ORION_POC_V1`
- composer insertion succeeds on fake textarea and fake contenteditable surfaces
- expected input/change events fire
- submit is never attempted
- existing reducer/scorer fixture runner still passes

## Tests Run

- `node --test test/reducer/*.test.js test/content/*.test.js`
  - result: 18 tests passed, 0 failed
- `node scripts/run-workflow-fixtures.mjs`
  - result: 3 fixtures, 20 events, 18 `PASS`, 2 `PASS_WITH_REPAIR`, 0 fail
- `node test-fixtures/composer/insert-only-smoke.mjs`
  - result: textarea and contenteditable fake-composer cases passed; no submit attempted
- `node scripts/build-ttd-mobile-extension.mjs`
  - result: built `dist/v0.1.2/chrome-ext`
- `node scripts/package-ttd-mobile-extension.mjs`
  - result: packaged `dist/v0.1.2/orion-ttd-mobile-extension-chrome-v0.1.2.zip`
- `node scripts/verify-ttd-mobile-extension.mjs`
  - result: verification passed for `v0.1.2`

## Phone-Side Update Validation

- Billy updated the Orion TTD Mobile Extension on iPhone away from the computer
- Orion iOS update path: PASS
- ChatGPT page use in Orion still worked after the update
- a normal phone-side ChatGPT message still came through
- this confirms update/install health only, not insert-only smoke success
- the actual Milestone 7 insertion trigger remains pending:
  `document.dispatchEvent(new CustomEvent("orion-ttd-run-insert-only-smoke"))`

## Manual Orion iPhone Test

1. Plug iPhone into Mac.
2. Open Orion on iPhone.
3. Open ChatGPT in Orion.
4. Open Safari Web Inspector for that Orion page.
5. Confirm:
   `document.documentElement.dataset.orionTtdInsertOnlyReady`
6. Make sure the composer is empty.
7. Run:
   `document.dispatchEvent(new CustomEvent("orion-ttd-run-insert-only-smoke"))`
8. Verify visible composer insertion of the `TTD_ORION_POC_V1` packet.
9. Do not press send.
10. Report pass/fail and any console errors.

## Rollback / Disable

- revert Milestone 7 source changes
- rebuild/package the extension
- update Orion with the reverted package if Billy wants to remove the smoke path

## Known Risks

- Orion iOS isolated worlds
- ChatGPT composer markup drift
- iOS focus/input quirks
- non-empty draft protection blocking insertion until the composer is cleared
