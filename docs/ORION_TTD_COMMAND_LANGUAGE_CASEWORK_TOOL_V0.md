# Orion TTD Command Language Casework Tool V0

## Purpose

Create a reusable local loop for command-language casework.

This tool lets Billy and ChatGPT design small `TTD_COMMAND_V1` language suites, run them against a real ChatGPT test page, capture visible assistant behavior, and feed the results back into fresh design chats.

## Why This Exists

The Orion extension proved transport and witness evidence on the real iPhone browser surface.

Command-language casework is a different layer:

- Orion transport tests prove packet insertion, no-submit boundaries, and witness evidence.
- command-language casework tests whether `continue`, `done`, `move_on`, `stuck`, `pause`, `side_question`, and fail-gracefully language steer the LLM lawfully.
- reducer/scorer tests remain the deterministic legal comparison layer.

The command-language layer should not require Codex for every research turn.

## Layer Distinction

- Orion extension:
  actuator and witness surface
- command-language casework tool:
  local batch runner for language/protocol research
- reducer/scorer:
  executable legal authority
- TTD TESTS Project chat:
  curated design/review source lane

The tool is evidence capture and batch running only. It does not gain route authority.

## Tool Architecture

Core loop:

1. The TTD TESTS Project chat gets the local mirror Casework bundle via `~/Desktop/Casework Start.command` (installed via `tools/command-language-casework/scripts/install-casework-start-command.sh`).
2. Billy asks that TTD TESTS Project chat for a JSON suite block.
3. Billy pastes the suite into the local GUI.
4. Billy installs the runner in a disposable generic ChatGPT test tab.
5. Billy clicks `Run`.
6. The runner sends the packet and scripted replies in explicit casework mode.
7. The runner records visible assistant replies and recovers results in-page via download/copy.
8. Billy drops the result files back into the TTD TESTS Project chat for Mermaid-first review, case-law matrix update, legal interpretation, and only then the next batch.
9. Local server result writing remains a separate legacy/server-assisted path, not a required self-contained postback.

## GUI Workflow

The GUI includes:

- Desktop launcher instructions (`~/Desktop/Casework Start.command`) and an experimental static snapshot fallback
- large suite JSON textarea
- `Validate`
- `Run`
- `Stop`
- `Save Draft Suite`
- `Open Results Folder`
- `Copy Latest Result Summary`
- `Copy Runner Loader`
- status log
- current case panel
- result links panel

## Localhost CSP Boundary

The local GUI/server is a before-run setup surface.

The self-contained runner executes inside `chatgpt.com`.

ChatGPT CSP can block localhost calls from inside the page, so self-contained runners must not depend on localhost postback.

Required self-contained recovery path:

- Blob download
- clipboard/copy fallback
- visible overlay completion message

Legacy/server-assisted localhost result writing may remain, but only as a separate mode.

## Suite Schema

Canonical schema file:

- `tools/command-language-casework/schema/casework-suite.schema.json`

Required case fields:

- `case_id`
- `title`
- `research_question`
- `packet`
- `scripted_user_replies`
- `expected_behavior`
- `forbidden_behavior`
- `expected_reducer_semantics`
- `classification_targets`

## Result Schema

Canonical schema file:

- `tools/command-language-casework/schema/casework-result.schema.json`

Each run writes:

- `input-suite.json`
- `run-result.json`
- `run-result.jsonl`
- `run-summary.md`
- `raw-transcript.txt`
- `case-logs/`

## Safety Boundaries

- explicit local casework mode only
- dedicated visible ChatGPT test chat only
- no cookies
- no `document.cookie`
- no `localStorage`
- no `sessionStorage`
- no `indexedDB`
- no `navigator.credentials`
- no `chrome.cookies`
- no hidden state mutation
- no reducer/scorer authority shift

## Send Policy

Auto-send exists only inside explicit local casework mode:

- Billy clicked `Run` in the GUI
- the injected runner is active on the visible ChatGPT test page
- the suite is already visible in the GUI
- every sent packet and reply is logged
- the runner exposes a visible `STOP` control

This is local research tooling, not production auto-submit.

## How To Run

Start the server:

```bash
node tools/command-language-casework/server/casework-server.mjs
```

Open the GUI:

```text
http://127.0.0.1:4317
```

Validate a suite from the terminal:

```bash
node tools/command-language-casework/server/casework-server.mjs --validate tools/command-language-casework/examples/desk-reset-baseline-suite.json
```

## How To Paste Suite Data

- use an example suite from `tools/command-language-casework/examples/`
- or paste JSON from the TTD TESTS Project chat after using the local mirror Casework bundle

## Local Mirror Bundle v1

Supported launcher:

- `~/Desktop/Casework Start.command`

Installer:

- `tools/command-language-casework/scripts/install-casework-start-command.sh`

Payload parts:

- Designer Skill
- Runner Schema Skill
- Current Study Status Skill

Desktop v1 behavior:

- reads designer/schema skill context from the local Command Center worktree or repo
- reads the current-study agenda from the live Orion repo status file:
  `tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md`
- falls back to the main local Command Center repo for skill files
- strips YAML/frontmatter from skill files
- copies a clean runtime bundle to clipboard
- opens `launch-casework.command`
- does not depend on Apps Script, Shortcuts, or live GitHub fetches
- may include a mirrored current-study skill as non-authoritative cached context:
  `library/skills/chatgpt/command-language-casework-current-study-status-skill.md`
- refuses to copy the bundle if the injected `Next Study Needed` pointer does not match the live Orion status file

Launcher:

- starts the local server
- opens the TTD TESTS Project chat, Casework GUI, and a disposable generic ChatGPT test tab
- tries to avoid stealing focus, but Chrome/macOS focus control is best effort only
- supports `CASEWORK_DESIGN_PROJECT_URL` and `CASEWORK_TEST_CHAT_URL` overrides if ChatGPT project links change

TTD TESTS Project chat:

- designs suites
- reviews result JSON with Mermaid-first reflection and proposes next study

Disposable ChatGPT test tab:

- runs the actual test runner

Experimental/demoted paths:

- static skill snapshot bookmarklet may still exist as a fallback convenience
- mobile/cloud router or Shortcut paths are separate experiments, not the supported desktop v1 path

After meaningful result review, use:

`tools/command-language-casework/scripts/import-tabulate-sync-casework-result.sh`

This imports the result, tabulates Orion study status, mirrors the current study-status skill, and lets the next Desktop bundle carry the updated next-study pointer.

Fresh skill-loaded chats and Desktop bundles must treat the live Orion `CASEWORK_STUDY_STATUS.md` file as the agenda authority. If the injected bundle reports a different `Next Study Needed` pointer, the bundle path is broken and should be rejected rather than trusted.

See also:

- `docs/ORION_TTD_CASEWORK_TESTING_PROJECT_SOURCE_RULE_V0.md`

## Casework Reflection Loop v1

The post-run flow is now explicit infrastructure:

1. raw result JSON is preserved as evidence
2. review Markdown is created in `study/reviews/`
3. Mermaid-first review identifies the most important pass/failure and usable-evidence status
4. deterministic layer classification names tool vs scorer vs language vs transport
5. the cumulative case-law matrix is regenerated
6. legal-system interpretation fields are applied
7. `CASEWORK_STUDY_STATUS.*` is updated without overwriting the manual next-study pointer by default
8. only then is a new suite allowed

Matrix artifacts:

- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.md`
- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.csv`
- `tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.jsonl`

Commands:

```bash
node tools/command-language-casework/scripts/import-casework-result.mjs <path-to-result.json>
node tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs
node tools/command-language-casework/scripts/tabulate-casework-study.mjs
```

Legal interpretation language:

- committed state is law
- logs/evidence are admissible evidence
- assistant prose is a claim
- signals are not state
- ambiguous cases HOLD
- choose the smallest legal reduction
- PASS/FAIL describes route survival, not wording perfection

## Supported Runner Path

- first run `~/Desktop/Casework Start.command`, paste the copied bundle into the TTD TESTS Project chat, and get the suite block there
- primary path: open the disposable generic ChatGPT test tab, validate suite, then `Copy Self-Contained Runner`
- paste the payload into a disposable ChatGPT test-chat console
- nothing sends until Billy clicks the visible overlay `Run` button
- clipboard handoff is preferred when the browser allows it; downloaded JSON remains the backup path
- legacy loader / server-run controls remain secondary and may be blocked by ChatGPT CSP
- the default GUI now presents this as a step lane and hides legacy/server controls in `Advanced / Legacy / Diagnostics`

## How Results Pop In Finder

When the runner completes, the local server writes the result folder and calls macOS Finder reveal using `open -R` on `run-summary.md`.

If Finder reveal fails, the GUI still shows the output paths.

## How To Drop Results Back Into ChatGPT

Use the copied result text as the first handoff path when available, or use the downloaded JSON file.

Recommended minimum:

- `run-summary.md`
- `run-result.json`

Those files preserve both a quick human summary and the raw per-case record.

## Layer Boundaries

- Designer Skill:
  fresh-chat behavior and result-review method
- Runner Schema Skill:
  current executable suite-shape authority
- Study Status:
  next-study pointer and open findings
- Casework GUI:
  validation, runner copy, and local evidence capture
- TTD TESTS Project chat:
  curated source lane for design/review only
- disposable generic ChatGPT test tab:
  runner execution only

## How This Differs From Orion Transport Tests

- Orion transport tests prove packet insertion, no-submit boundaries, and witness evidence on the real mobile surface.
- command-language casework proves or challenges `TTD_COMMAND_V1` language and route behavior.

## First Live Self-Contained Run Finding

- the CSP-safe architecture succeeded: inline payload install, overlay display, and result download all worked
- the first live ChatGPT run failed at visible send-button detection before any scripted messages were sent
- earlier `PASS_CANDIDATE` labeling for that outcome was misleading because no route trial actually occurred
- tool failures are now labeled explicitly, including `TOOL_FAIL_SEND_BUTTON_NOT_FOUND`, `TOOL_FAIL_COMPOSER_NOT_FOUND`, `TOOL_FAIL_COMPOSER_INSERT_VERIFY`, `TOOL_FAIL_MESSAGE_NOT_SENT`, and `TOOL_FAIL_RESPONSE_NOT_OBSERVED`
- the runner now stops after the first tool-send failure and exposes overlay diagnostics for composer discovery, insert verification, send-button selection, and last error

## First Successful Send Run And Turn-Boundary Finding

- runner send activation now works on the live ChatGPT page
- the next live finding was sequencing: ChatGPT can accept a new send while the previous assistant turn still shows `Thinking` / `Stop answering`
- the runner must therefore treat `Stop answering`, `Thinking`, and changing assistant text as hard locks before any scripted follow-up reply
- completed assistant responses must be stable DOM text, not transient `Thinking`
- `dom_turn_trace` is now required evidence in the result JSON for language casework analysis

## How This Differs From Reducer/Scorer Tests

- reducer/scorer tests are deterministic local legal checks
- casework tests observe live assistant prose and visible route behavior on a real ChatGPT page

## How It Supports Language Case Law

Every casework run creates durable result files that can become:

- packet wording precedent
- route-behavior precedent
- fail-gracefully precedent
- next-batch design input

That keeps the language research loop local, repeatable, and teachable without turning Codex into the ongoing experiment operator.

## Study Progress Loop

Casework research now operates as a continuous loop via local tabulation:

- A fresh chat checks `CASEWORK_STUDY_STATUS.md`
- The chat designs a suite based on the next-study pointer
- The GUI validates the suite
- A disposable ChatGPT runs the suite
- The result JSON is imported locally (`import-casework-result.mjs`)
- Tabulation rebuilding indexes/status (`tabulate-casework-study.mjs`)
- The next chat reads the updated status

Data relationships:
- **raw result JSON** = evidence
- **review Markdown** = human/LLM interpretation
- **indexes** = generated map
- `CASEWORK_STUDY_STATUS.md` = next-study pointer
- **spreadsheets/matrices** = higher-order distillation into state laws and skill language (e.g., Fail/Recover Map, Pre-Collapse Steering Matrix, LLM Legal Deference Map)
- **casework result indexes** = live empirical evidence feeding those maps
