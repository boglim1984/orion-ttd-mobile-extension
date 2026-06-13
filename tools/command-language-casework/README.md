# Command Language Casework Tool

This is the local language-lab loop for Orion TTD command-language research.

It exists so Billy and ChatGPT can design, run, and analyze `TTD_COMMAND_V1` language batches without depending on Codex for every research round.

## What It Does

- injects a Casework Designer Skill prompt into the current ChatGPT dev chat by a "Casework Start" macOS Shortcut bridge (via tiny bookmarklet)
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
2. If Shortcuts fails silently, run `~/Desktop/Casework Start.command` instead. This is the supported v1 launcher. It will fetch the skill and launch the support tabs. Paste the clipboard payload into your ChatGPT dev chat.
3. Keep the newly-opened Casework GUI and support tabs visible.
4. Ask the dev chat to design the next suite JSON block.
5. Use the GUI step lane to load/paste that suite and validate it.
6. Copy the self-contained runner for the current suite.
7. Paste it into the disposable ChatGPT page console once per page load, then use the overlay `Run` button.
8. Use the copied result text as the main handoff if the browser allows clipboard access. Use the downloaded `orion-casework-result-*.json` file as backup.

## Mental Model

Dev chat designs the test suite. Casework GUI validates JSON and copies the runner. Disposable ChatGPT executes the test. Result JSON comes back to the dev chat for Mermaid review.

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

- The Casework Start bookmarklet triggers the macOS Shortcut. The Shortcut reads the fresh skill from disk and opens support tabs. The bookmarklet itself is tiny and does not contain the skill body.
- The `launch-casework.command` launcher starts the local server and opens the support tabs quietly when macOS/Chrome allow it.
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
- Tabulation rebuilds indexes/status via `tabulate-casework-study.mjs`
- Next chat reads the updated status

Data relationships:
- **raw result JSON** = evidence
- **review Markdown** = human/LLM interpretation
- **indexes** = generated map (run map, case map)
- `CASEWORK_STUDY_STATUS.md` = next-study pointer
- **spreadsheets/matrices** = higher-order distillation into state laws and skill language (e.g., Fail/Recover Map, Pre-Collapse Steering Matrix, LLM Legal Deference Map)
- **casework result indexes** = live empirical evidence feeding those maps
