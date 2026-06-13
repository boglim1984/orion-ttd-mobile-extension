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

- the dev chat now has a tiny `Copy Start Bookmarklet` helper
- the Casework Start bookmarklet triggers a macOS Shortcut
- the Shortcut fetches the fresh skill from disk and copies it to the clipboard
- the Shortcut also launches the local server, Casework GUI, and a disposable ChatGPT tab
- the GUI provides a backup "Skill Snapshot" bookmarklet with a static embedded prompt
- the bookmarklets do not run tests or click `Send`

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
- `CASEWORK_REFLECTION_LOOP_V1.md` defines the required post-run review order.
- `update-casework-case-law-matrix.mjs` regenerates cumulative matrix rows from imported raw results.
- `tabulate-casework-study.mjs` rebuilds indexes and the `CASEWORK_STUDY_STATUS` file.
- The status file contains a `manual_next_study` pointer that remains stable until human/LLM review overwrites it.
- A GitHub Action commits updated indexes and status.
- The `Command Language Casework Designer Skill` now requires a fresh chat to read the current status before designing suites.

## Casework Reflection Loop v1

- raw result JSON remains evidence
- review Markdown remains interpretation
- case-law matrix artifacts are cumulative normalized analysis
- legal-system fields provide authority/evidence language for interpretation, not runtime Judge logic
- the next suite is blocked until import, Mermaid-first review, matrix regeneration, legal interpretation, and study-status review are complete

Matrix artifacts:

- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.md`
- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.csv`
- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.jsonl`

Three-surface workflow:

- design chat creates suites and reviews results
- Casework GUI validates and exposes reflection-loop affordances
- disposable ChatGPT executes the self-contained runner

## Next Action

Use the dev-chat bookmarklet to design the next suite, run it through the GUI plus disposable ChatGPT support tab, drop `run-summary.md` and `run-result.json` into the dev chat for Mermaid review, and run `import-casework-result.mjs` then `tabulate-casework-study.mjs` to advance the local study tracker.
