# Command Language Casework Tool Report

## Status

Implemented.

## Files Created

- `tools/command-language-casework/README.md`
- `tools/command-language-casework/schema/casework-suite.schema.json`
- `tools/command-language-casework/schema/casework-result.schema.json`
- `tools/command-language-casework/server/casework-server.mjs`
- `tools/command-language-casework/public/index.html`
- `tools/command-language-casework/public/casework-ui.js`
- `tools/command-language-casework/public/casework-style.css`
- `tools/command-language-casework/injectors/chatgpt-casework-runner.js`
- `tools/command-language-casework/lib/`
- `tools/command-language-casework/examples/`
- `tools/command-language-casework/tests/`
- `docs/ORION_TTD_COMMAND_LANGUAGE_CASEWORK_TOOL_V0.md`

## Tool Status

Implemented as local tooling only.

The server, GUI, suite validator, heuristic classifier, result writer, and console-injected runner are all present.

The tool now also includes a Casework Designer Skill bookmarklet helper for the current ChatGPT dev chat and a quieter launcher for the support tabs.

## How It Was Tested

- example suite validation
- missing-field validation failure
- heuristic classifier unit checks
- result-writer artifact creation
- runner source safety check for forbidden storage and credential APIs
- local server smoke on `http://127.0.0.1:45317/api/state`

## Example Suites

- `tools/command-language-casework/examples/desk-reset-baseline-suite.json`
- `tools/command-language-casework/examples/side-question-return-suite.json`
- `tools/command-language-casework/examples/ambiguity-fail-gracefully-suite.json`

## Known Limitations

- the current runner is console-injected, not a full cross-tab browser controller
- live localhost communication may depend on browser allowance for loopback requests from the ChatGPT page
- conservative selectors are used, but ChatGPT DOM changes can still break composer or send detection
- heuristic classifications are advisory only and do not replace reducer/scorer or human review

## GUI Simplification Update

- the GUI now defaults to a calm step-lane flow instead of a wrapped pile of buttons
- the supported self-contained path is the only prominent lane
- legacy server-run controls, loader snippet, and raw diagnostics moved behind `Advanced / Legacy / Diagnostics`
- the GUI now exposes an example-suite loader and a launcher script for opening the GUI plus a disposable ChatGPT tab

## Skill Bookmarklet And Launcher Split

- the dev chat now has a dedicated `Copy Skill Bookmarklet` helper that injects the Command Language Casework Designer Skill prompt without sending
- the bookmarklet shows a small popup that explains the mental model and points Billy to the support tabs
- the bookmarklet does not start the local server, does not run tests, and does not click `Send`
- the launcher now owns the support-tab job: start server, open Casework GUI, open disposable ChatGPT, copy setup note
- focus preservation is best effort only; the launcher now says so directly instead of pretending it is guaranteed

## Handoff Tightening Update

- the main lane no longer shows the long console-setup helper button or draft-save control
- the hero copy is now a single compact run sentence instead of a longer warning paragraph
- overlay completion now tries to copy a usable result payload to clipboard and tells Billy to paste the result back into ChatGPT
- downloaded result JSON still remains the backup artifact when clipboard write is blocked

## First Live Self-Contained Run Finding

- the self-contained payload architecture worked: inline install, overlay display, and downloaded results all succeeded on the live ChatGPT page
- the first live run did not send any scripted messages because the runner could not find the visible ChatGPT send button
- that result is a runner tool failure, not a command-language pass/fail result
- previous `PASS_CANDIDATE` labeling for this situation was incorrect
- the runner now records explicit `TOOL_FAIL_*` labels, stops after the first send/composer tool failure, and emits overlay diagnostics for selector investigation
- the self-contained download path is now the primary documented path; server-side result buttons remain secondary/legacy

## First Successful Send Run And Turn-Boundary Finding

- send activation is now proven: the runner can install, insert, activate send, and download results
- the first successful send run exposed a sequencing bug: the runner advanced while ChatGPT still showed `Thinking` / `Stop answering`
- this is a tool failure, not a language-behavior pass
- the runner now treats active-generation indicators as hard locks and records `TOOL_FAIL_TURN_SEQUENCING_NO_ASSISTANT_COMPLETION` when assistant completion is not safely observed
- result files now carry `dom_turn_trace` so DOM-level timing and UI-state evidence survive without screenshots

## Validation Request Shape Fix

- Validate Suite now accepts the GUI textarea suite through a normalized server request shape.
- The skill bookmarklet remains the dev/design chat setup surface.
- The validation fix is separate from runner execution.

## Study Progress Loop

- A local import/tabulation loop now tracks study status.
- `import-casework-result.mjs` consumes raw result JSON.
- `tabulate-casework-study.mjs` rebuilds indexes and the `CASEWORK_STUDY_STATUS` file.
- The status file contains a `manual_next_study` pointer that remains stable until human/LLM review overwrites it.
- A GitHub Action commits updated indexes and status.
- The `Command Language Casework Designer Skill` now requires a fresh chat to read the current status before designing suites.

## Next Action

Use the dev-chat bookmarklet to design the next suite, run it through the GUI plus disposable ChatGPT support tab, drop `run-summary.md` and `run-result.json` into the dev chat for Mermaid review, and run `import-casework-result.mjs` then `tabulate-casework-study.mjs` to advance the local study tracker.
