# Command Language Casework Tool

This is the local language-lab loop for Orion TTD command-language research.

It exists so Billy and ChatGPT can design, run, and analyze `TTD_COMMAND_V1` language batches without depending on Codex for every research round.

## What It Does

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

1. Start the server, or run `tools/command-language-casework/launch-casework.command`.
2. Open a disposable ChatGPT test chat.
3. Use the GUI step lane to load/paste a suite and validate it.
4. Copy the self-contained runner for the current suite.
5. Paste it into the ChatGPT page console once per page load, then use the overlay `Run` button.
6. Use the downloaded `orion-casework-result-*.json` file as the primary result artifact.

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

- The supported path is the self-contained payload, not the legacy localhost bootstrap.
- The legacy loader and server-run buttons remain available as secondary tooling only.
- Use this only in dedicated test chats.
- The GUI now hides legacy/server-run controls under `Advanced / Legacy / Diagnostics`.
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
