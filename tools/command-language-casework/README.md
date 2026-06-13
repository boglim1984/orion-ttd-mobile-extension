# Command Language Casework Tool

This is the local language-lab loop for Orion TTD command-language research.

It exists so Billy and ChatGPT can design, run, and analyze `TTD_COMMAND_V1` language batches without depending on Codex for every research round.

## What It Does

- copies a local mirror Casework bundle into the clipboard for a fresh ChatGPT dev chat
- serves a local GUI for pasted suite JSON
- validates suite structure before a run
- provides a console-injected ChatGPT runner
- runs scripted packet/reply sequences only after an explicit GUI `Run`
- records visible assistant replies and raw turn logs
- writes local result folders
- reveals the latest result in Finder

## What It Does Not Do

- it is not Orion runtime authority
- it is not reducer/scorer authority
- it does not read cookies, local storage, session storage, IndexedDB, or credential APIs
- it is not a general browser agent

## Commands

Start the GUI server:

```bash
node tools/command-language-casework/server/casework-server.mjs
```

Validate a suite file:

```bash
node tools/command-language-casework/server/casework-server.mjs --validate tools/command-language-casework/examples/desk-reset-baseline-suite.json
```

## First Run

1. Open a new, disposable ChatGPT chat window to serve as your dev environment.
2. Run `~/Desktop/Casework Start.command`. This is the supported v1 launcher. It copies the local mirror bundle and launches the support tabs. Paste the clipboard payload into your ChatGPT dev chat. If you do not have it installed, run `tools/command-language-casework/scripts/install-casework-start-command.sh`.
3. Keep the newly-opened Casework GUI and support tabs visible.
4. Ask the dev chat to design the next suite JSON block.
5. Use the GUI step lane to load/paste that suite and validate it.
6. Copy the self-contained runner for the current suite.
7. Paste it into the disposable ChatGPT page console once per page load, then use the overlay `Run` button.
8. Use the copied result text as the main handoff if the browser allows clipboard access. Use the downloaded `orion-casework-result-*.json` file as backup.

## Three-Surface Workflow

- Design chat designs the suite, reviews result JSON, and decides the next study.
- Casework GUI validates suite JSON, copies the runner, and exposes reflection-loop affordances.
- Disposable ChatGPT executes the self-contained runner in a visible test tab.

The launcher opens the GUI and a disposable ChatGPT tab. The design chat is this current chat or a separate chat Billy opens manually.

## Example Suites

- `examples/desk-reset-baseline-suite.json`
- `examples/side-question-return-suite.json`
- `examples/ambiguity-fail-gracefully-suite.json`

## Result Output

Runs are written under:

```text
tools/command-language-casework/results/YYYYMMDD-HHMMSS-suite_id/
```

Each run includes:

- `input-suite.json`
- `run-result.json`
- `run-result.jsonl`
- `run-summary.md`
- `raw-transcript.txt`
- `case-logs/`

## Notes

- Desktop v1 uses the local mirror bundle launcher, not Apps Script, Shortcuts, or live GitHub fetches.
- The payload parts are Designer Skill, Runner Schema Skill, and Current Study Status Skill.
- The `launch-casework.command` launcher starts the local server and opens the support tabs quietly when macOS/Chrome allow it.
- The static skill-snapshot bookmarklet remains experimental and may become stale.
- The supported path is the self-contained payload, not the legacy localhost bootstrap.
- The legacy loader and server-run buttons remain available as secondary tooling only.
- Use this only in dedicated test chats.
- The GUI now hides legacy/server-run controls under `Advanced / Legacy / Diagnostics`.
- Draft/save and setup-note controls are also secondary and live in `Advanced / Legacy / Diagnostics`.
- The self-contained runner embeds the current suite JSON, so copy it after validating the suite you intend to run.

## First Live Self-Contained Run Finding

- The CSP-safe payload and result download path worked on the live ChatGPT page.
- The first live run failed at send-button discovery before any scripted message was sent.
- That outcome is a runner tool failure, not a command-language result.
- Tool failures now classify as `TOOL_FAIL_*` labels such as `TOOL_FAIL_SEND_BUTTON_NOT_FOUND` instead of `PASS_CANDIDATE`.
- The runner now stops after the first send/composer tool failure and exposes overlay diagnostics for composer and send-button discovery.

## First Successful Send Run And Turn-Boundary Finding

- The runner now reaches send activation on the live ChatGPT page.
- The first successful send run exposed a new tool failure: ChatGPT accepts another send while the prior answer is still thinking.
- `Stop answering` and `Thinking` must be treated as hard turn-boundary locks before any scripted follow-up reply is sent.
- Result JSON now includes `dom_turn_trace` so timing, stop-button visibility, send visibility, and assistant/user DOM state are visible without screenshots.

## Study Progress Loop

- Fresh chat checks `CASEWORK_STUDY_STATUS.md`
- Chat designs suite based on status
- GUI validates suite
- Disposable ChatGPT runs suite
- Result JSON is imported locally via `import-casework-result.mjs`
- Reflection review is completed via `CASEWORK_REFLECTION_LOOP_V1.md`
- Case-law matrix is regenerated via `update-casework-case-law-matrix.mjs`
- Tabulation rebuilds indexes/status via `tabulate-casework-study.mjs`
- Meaningful reviewed results should normally go through `tools/command-language-casework/scripts/import-tabulate-sync-casework-result.sh`
- Next chat reads the updated status

Data relationships:
- **raw result JSON** = evidence
- **review Markdown** = human/LLM interpretation
- **indexes** = generated map (run map, case map)
- `CASEWORK_STUDY_STATUS.md` = next-study pointer
- `study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.*` = cumulative normalized case-law analysis
- **spreadsheets/matrices** = higher-order distillation into state laws and skill language (e.g., Fail/Recover Map, Pre-Collapse Steering Matrix, LLM Legal Deference Map)
- **casework result indexes** = live empirical evidence feeding those maps

## Casework Reflection Loop v1

Required order:

1. Preserve raw result JSON.
2. Import/save it into `study/raw/` and `study/reviews/`.
3. Complete Mermaid-first review.
4. Identify most important pass/failure and classify tool vs scorer vs language vs transport.
5. Regenerate the cumulative case-law matrix.
6. Apply legal-system interpretation fields.
7. Update `CASEWORK_STUDY_STATUS.*`.
8. Only then design the next suite.

Key references:

- `tools/command-language-casework/study/CASEWORK_REFLECTION_LOOP_V1.md`
- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.md`

Run the post-run scripts with:

```bash
node tools/command-language-casework/scripts/import-casework-result.mjs <path-to-result.json>
node tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs
node tools/command-language-casework/scripts/tabulate-casework-study.mjs
```

The next suite is allowed only after the manual next-study pointer has been checked and the reflection loop is complete.

## Local Mirror Bundle v1

- Supported launcher:
  `~/Desktop/Casework Start.command`
- Installer:
  `tools/command-language-casework/scripts/install-casework-start-command.sh`
- Payload parts:
  Designer Skill, Runner Schema Skill, Current Study Status Skill
- Current study status is mirrored as a Command Center skill/source:
  `library/skills/chatgpt/command-language-casework-current-study-status-skill.md`
- After meaningful result review, use:
  `tools/command-language-casework/scripts/import-tabulate-sync-casework-result.sh`
- That syncs the next-study pointer into the next clipboard bundle.
- Desktop v1 does not depend on Apps Script, Shortcuts, or live GitHub.
- Mobile/cloud routes may still use separate experimental router paths if Billy chooses them later.
- Shortcut/bookmarklet start paths are experimental or demoted, not the supported desktop v1 path.
