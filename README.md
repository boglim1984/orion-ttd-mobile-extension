# Orion TTD Mobile Extension

This is the real TTD Mobile Extension shell.

- Chrome-style WebExtension is canonical.
- Orion iOS is the source-of-truth runtime.
- GitHub Pages update loop is canonical.
- Bookmarklet remains fallback.
- Safari Web Inspector is the debugger.
- v0.1.3 supports manual-trigger insert-only composer smoke plus low-noise witness channels.
- v0.1.3 does not perform submit behavior.

## Layout

- `src/`: manifest and content-script templates
- `scripts/`: build, package, and verification scripts
- `docs/`: protocol, reducer, workflow, Mermaid, and smartness-budget design docs
- `test-fixtures/`: canonical workflow fixtures for future reducer/scorer work
- `dist/`: built extension artifacts
- `updates/`: Chrome update metadata
- `reports/`: local run/report artifacts

## Milestone 5 Design Docs

- `docs/ORION_TTD_COMMAND_PROTOCOL_V0.md`
- `docs/ORION_TTD_REDUCTION_HARNESS_V0.md`
- `docs/ORION_TTD_REDUCER_V0.md`
- `docs/ORION_TTD_SCORER_FIXTURE_RUNNER_V0.md`
- `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
- `docs/ORION_TTD_MERMAID_PLANNING_RULE_V0.md`
- `docs/ORION_TTD_SMARTNESS_BUDGET_V0.md`
- `docs/ORION_TTD_MILESTONE_7_INSERT_ONLY_SMOKE.md`
- `docs/ORION_TTD_MILESTONE_8_MANUAL_WORKFLOW_TRIAL_V0.md`
- `docs/ORION_TTD_MILESTONE_8_5_WEBKIT_MCP_TETHER_SPIKE_V0.md`
- `legal-framework/README.md`
- `legal-framework/v1/ORION_TTD_FAIL_GRACEFULLY_HUMAN_WITNESS_ESCALATION_V1.md`
- `legal-framework/v1/ORION_TTD_STATE_HARNESS_CONSTITUTION_V1.md`
- `llm-legal-deference/README.md`
- `llm-legal-deference/v1/summaries/llm_legal_deference_map_v1_summary.md`
- `llm-legal-deference/v1/summaries/legal_spreadsheet_comparative_analysis_v1.md`
- `precollapse-steering-language/README.md`
- `precollapse-steering-language/v1/summaries/precollapse_steering_language_v1_summary.md`
- `test-fixtures/manual/orion-milestone-8-manual-trial-packet.txt`
- `test-fixtures/workflows/`
- `reports/milestone-6b-pure-reducer-report.md`
- `reports/milestone-8/manual-workflow-trial-report.md`
- `docs/mcp/orion-webkit-mcp-client-configs.md`
- `reports/milestone-8-5/webkit-mcp-tether-spike-report.md`
- `scripts/run-workflow-fixtures.mjs`
- `scripts/orion-webkit-mcp-tether-probe.mjs`
- `reports/milestone-6c-scorer-fixture-runner-report.md`

## v0.1.3 behavior

The content script only runs on ChatGPT pages and exposes page-visible DOM dataset stamps on `document.documentElement`:

- `dataset.orionTtdBuild`
- `dataset.orionTtdFlavor`
- `dataset.orionTtdChannel`
- `dataset.orionTtdLoaded`
- `dataset.orionTtdInfo`
- `dataset.orionTtdInsertOnlyReady`
- `dataset.orionTtdInsertOnlyLastResult`
- `dataset.orionTtdLastWitness`
- `dataset.orionTtdLastWitnessKind`
- `dataset.orionTtdLastWitnessAt`

Witness DOM node:

- `#orion-ttd-witness`

Witness console prefix:

```text
[ORION_TTD]
```

The content script also keeps these internal globals:

- `window.__ORION_TTD_BUILD__`
- `window.__ORION_TTD_INFO__`
- `window.__ORION_TTD_SMOKE__()`
- `window.__ORION_TTD_INSERT_ONLY_SMOKE__()`

Console output:

```text
[ORION TTD MOBILE] version=0.1.3 flavor=chrome
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

## Billy v0.1.3 test flow

1. Open Orion iOS Extensions and tap `Update` for the installed Orion TTD Mobile Extension.
2. Open `https://chatgpt.com/` in Orion iOS.
3. Attach Safari Web Inspector from the Mac.
4. Run:

```javascript
document.documentElement.dataset.orionTtdBuild
document.documentElement.dataset.orionTtdFlavor
document.documentElement.dataset.orionTtdChannel
document.documentElement.dataset.orionTtdLoaded
document.documentElement.dataset.orionTtdInfo
document.documentElement.dataset.orionTtdInsertOnlyReady
```

Expected results:

- build returns `"0.1.3"`
- flavor returns `"chrome"`
- channel returns `"orion-ios-github-pages-update"`
- loaded returns `"true"`
- info contains version `0.1.3` and flavor `chrome`
- insert-only ready returns `"true"`
- composer insertion occurs only after an explicit manual trigger
- no submit occurs
