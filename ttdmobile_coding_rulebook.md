# TTD Mobile Extension Coding Rulebook

## First rule: use the Chrome-style Orion iOS update loop
When working on the Orion/TTD mobile extension, use the proven Chrome-style GitHub-hosted Orion iOS update loop as the default dev rig:
AG/Codex edits extension code
→ bump Chrome-style WebExtension version
→ build Chrome-style package
→ publish package and Chrome update metadata to GitHub Pages
→ Billy taps Update in Orion iOS
→ Safari Web Inspector confirms the new build stamp.

- Chrome-style WebExtension is canonical.
- Chrome update metadata is canonical.
- Firefox-style builds are fallback/probe only.
- Billy confirmed the working installed/update path was Chrome.
- Milestone Result Note: `project-cards/ios-orion-browser-mobile-ttd-injector-milestone-3-extension-update-loop-result.md`

## Source of truth
Orion iOS is the runtime/source-of-truth platform for extension behavior. Desktop/Chrome/Playwright tests may be used as lab scaffolding only. Do not treat desktop behavior as the final indicator of success.

## Dev rig
The standard update loop requires these components:
- Chrome-style WebExtension package
- GitHub Pages update host
- Chrome update XML
- version bump
- package build
- update metadata
- Orion Update button
- Safari Web Inspector build-stamp verification

## Build stamp rule
Every content-script build must expose a visible/checkable build stamp so updates can be instantly verified from Safari Web Inspector. The preferred verification contract is a page-visible DOM stamp such as dataset attributes on `document.documentElement`, because Orion content scripts may run in an isolated or user-script world where page-console globals are not the safest primary signal.

For probe builds, the older pattern was:
```javascript
window.__ORION_TTD_UPDATE_PROBE_BUILD__
window.__ORION_TTD_UPDATE_PROBE_FLAVOR__
window.__ORION_TTD_UPDATE_PROBE_INFO__
window.__ORION_TTD_UPDATE_PROBE_SMOKE__()
```

Rule:

- prefer a DOM-visible dataset stamp or other agreed page-visible marker as the primary verification surface;
- console logs may help, but they are secondary to page-visible verification;
- do not rely on page globals as the preferred verification contract;
- if globals exist for debugging, treat them as supplementary, not canonical.

## Install/update rules
- AG/Codex must not assume iCloud Drive direct install works; iCloud direct install failed.
- The known working initial install path is the iPhone-local Orion extension path (from iOS Files).
- The known working update path is Orion’s built-in Update button pulling from Chrome-style GitHub-hosted update metadata.
- Agents must distinguish initial install from update.
- Agents must not ask Billy to reinstall manually if a normal version bump/update metadata change can use the proven Chrome update loop.
- Manual reinstall remains a fallback only.

## Safety rules
The extension must remain safe, visible, and auditable:
- No credentials/secrets/private session data in public probes or default dev builds.
- No cookies/tokens/localStorage reads.
- No session DB inspection.
- No hidden auto-submit.
- Visible/auditable packets.
- Submit is POC-gated only.
- Public update probes must remain harmless and must not contain private data.

## Fail/recover map

Rules:
- Before implementing command protocol, workflow tests, reducer/scorer logic, repair packets, or recovery behavior, read:
  `fail-recover-map/README.md`
  and the latest fail/recover map files.
- Before modifying reducer behavior, also read:
  `docs/ORION_TTD_REDUCER_V0.md`
  `docs/ORION_TTD_REDUCTION_HARNESS_V0.md`
  `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
  `fail-recover-map/README.md`
- Before modifying scorer or fixture-runner behavior, also read:
  `docs/ORION_TTD_SCORER_FIXTURE_RUNNER_V0.md`
  `docs/ORION_TTD_REDUCER_V0.md`
  `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
  `fail-recover-map/README.md`
- Before implementing command protocol, workflow tests, reducer/scorer logic, repair packets, recovery behavior, metrics, or skill-library design, also read:
  `docs/ORION_TTD_COMMAND_PROTOCOL_V0.md`
  `docs/ORION_TTD_REDUCTION_HARNESS_V0.md`
  `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
- Treat the XLSX as the human-editable source artifact.
- Treat CSV/JSON/JSONL as agent-ingest/test-generation formats.
- Do not let the map override the rulebook or project card.
- Use the map to choose test cases, failure classes, recovery mechanisms, and metrics.
- When real tests reveal new failures, update the map or create a new version instead of burying discoveries in chat only.

## Architecture boundary
- Orion project is the product/integration home.
- Orion iOS is the source-of-truth runtime.
- Skill Dump is the injector ancestor/source material.
- TTD main is the research/state-machine source material.
- This extension is the clean Orion-first rebuild. Do not port old systems wholesale.
- Do not make the bookmarklet, scheduler, or browser tab the source of truth.
- Command Center is memory/status/rules, not working copy.
- Code Projects are implementation working copies.
- Bookmarklet remains fallback/manual launcher.
- Safari Web Inspector remains live debugger.

## Agent workflow
1. Read this rulebook.
2. Inspect current Chrome version/update metadata.
3. Make the smallest change necessary.
4. Bump Chrome-style version.
5. Build Chrome package.
6. Publish package and Chrome update metadata.
7. Tell Billy exact Orion Update test steps.
8. Include Safari Web Inspector commands to verify build stamp.
9. Wait for Billy’s report before next update job.
10. Every update job must state which version is currently installed, which version is the update target, and explicitly confirm that it is using the Chrome channel unless testing Firefox fallback.

## Current known probe
Public probe repo: `https://github.com/boglim1984/orion-ttd-update-probe`
GitHub Pages base: `https://boglim1984.github.io/orion-ttd-update-probe/`

**Canonical (Chrome-style):**
- Update XML: `https://boglim1984.github.io/orion-ttd-update-probe/updates/chrome-updates.xml`

**Fallback/probe only (Firefox-style):**
- Update JSON: `https://boglim1984.github.io/orion-ttd-update-probe/updates/firefox-updates.json`

## Open questions
- Exact final TTD build-stamp global name.
- Whether to keep Firefox fallback builds in the main repo or split them later.
- Which Chrome manifest version is most robust in Orion iOS.
- What exact package format is best long-term.
- How to transition from public harmless probe to real extension without leaking private logic/secrets.
- How much TTD state belongs in the extension versus Command Center/local state.
