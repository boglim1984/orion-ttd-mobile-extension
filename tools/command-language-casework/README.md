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

1. Use the dedicated TTD TESTS Project chat as the design/review context.
2. Run `~/Desktop/Casework Start.command`. This is the supported v1 launcher. It copies the local mirror bundle and launches the TTD TESTS Project chat, Casework GUI, and disposable generic ChatGPT test tab. Paste the clipboard payload into the TTD TESTS Project chat. If you do not have it installed, run `tools/command-language-casework/scripts/install-casework-start-command.sh`.
3. Keep the newly-opened Casework GUI and disposable runner tab visible.
4. Ask the TTD TESTS Project chat to design the next suite JSON block.
5. Use the GUI step lane to load/paste that suite and validate it.
6. Copy the self-contained runner for the current suite.
7. Paste it into the disposable ChatGPT page console once per page load, then use the overlay `Run` button.
8. Use the copied result text as the main handoff if the browser allows clipboard access. Use the downloaded `orion-casework-result-*.json` file as backup.

## Three-Surface Workflow

- TTD TESTS Project chat designs the suite, reviews result JSON, and decides the next study.
- Casework GUI validates suite JSON, copies the runner, and exposes reflection-loop affordances.
- Disposable ChatGPT test tab executes the self-contained runner in a visible generic test tab.

Boundary:

- local server / GUI: before-run setup, validation, runner generation/copy
- disposable ChatGPT tab: self-contained execution and in-page result download/copy
- not allowed as required behavior: ChatGPT page POSTing result to localhost

The launcher opens the TTD TESTS Project chat, the GUI, and a disposable generic ChatGPT test tab.

## Config

- `CASEWORK_DESIGN_PROJECT_URL`: design/review ChatGPT Project URL override
- `CASEWORK_TEST_CHAT_URL`: disposable generic ChatGPT test-tab override

The current default design-project target is defined once in `tools/command-language-casework/scripts/launch-casework.sh`. Change `CASEWORK_DESIGN_PROJECT_URL` if ChatGPT Project links change.

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
- ChatGPT CSP can block localhost calls from inside the page; self-contained runners must not depend on localhost postback.
- The legacy loader and server-run buttons remain available as secondary tooling only.
- Use this only in dedicated test chats.
- The GUI now hides legacy/server-run controls under `Advanced / Legacy / Diagnostics`.
- Draft/save and setup-note controls are also secondary and live in `Advanced / Legacy / Diagnostics`.
- The self-contained runner embeds the current suite JSON, so copy it after validating the suite you intend to run.
- Blob download and clipboard/copy fallback are the supported self-contained result recovery path.
- After any runner/tool patch, discard old clipboard, console-history, or saved payload text and click `Copy Self-Contained Runner` again.
- Fresh payloads now include a visible no-localhost stamp and copy-time status message so stale payload reuse is easier to spot.

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

- TTD TESTS Project chat checks `CASEWORK_STUDY_STATUS.md`
- TTD TESTS Project chat designs suite based on status
- GUI validates suite
- Disposable ChatGPT test tab runs suite
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
Completed manual next-study agendas must be explicitly retired before the next fresh-chat design cycle.

## Local Mirror Bundle v1

- Supported launcher:
  `~/Desktop/Casework Start.command`
- Installer:
  `tools/command-language-casework/scripts/install-casework-start-command.sh`
- Payload parts:
  Designer Skill, Runner Schema Skill, Current Study Status Skill
- Agenda authority for fresh chats and Desktop bundles:
  `tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md`
- The mirrored Command Center current-study skill may still exist as cached context:
  `library/skills/chatgpt/command-language-casework-current-study-status-skill.md`
- That mirror is non-authoritative until explicitly regenerated from the live Orion status.
- After meaningful result review, use:
  `tools/command-language-casework/scripts/import-tabulate-sync-casework-result.sh`
- That refreshes the live study artifacts and may also regenerate the mirrored current-study skill.
- The Desktop launcher now refuses to copy a bundle when the injected `Next Study Needed` pointer does not match the live Orion status file.
- Desktop v1 does not depend on Apps Script, Shortcuts, or live GitHub.
- Launcher config:
  `CASEWORK_DESIGN_PROJECT_URL` and `CASEWORK_TEST_CHAT_URL`
- Mobile/cloud routes may still use separate experimental router paths if Billy chooses them later.
- Shortcut/bookmarklet start paths are experimental or demoted, not the supported desktop v1 path.
