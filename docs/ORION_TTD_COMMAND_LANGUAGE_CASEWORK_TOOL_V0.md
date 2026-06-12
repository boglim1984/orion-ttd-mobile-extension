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

The tool is evidence capture and batch running only. It does not gain route authority.

## Tool Architecture

Core loop:

1. ChatGPT skill designs a JSON suite.
2. Billy pastes the suite into the local GUI.
3. Billy installs the runner in a disposable ChatGPT test chat.
4. Billy clicks `Run`.
5. The runner sends the packet and scripted replies in explicit casework mode.
6. The runner records visible assistant replies and sends them back to the local server.
7. The server writes result files and reveals them in Finder.
8. Billy drops the result files back into a fresh skill-loaded chat to design the next batch.

## GUI Workflow

The GUI includes:

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
- or paste JSON from a fresh chat using the Command Language Casework Designer Skill

## How Results Pop In Finder

When the runner completes, the local server writes the result folder and calls macOS Finder reveal using `open -R` on `run-summary.md`.

If Finder reveal fails, the GUI still shows the output paths.

## How To Drop Results Back Into ChatGPT

Use the result folder as the next skill input.

Recommended minimum:

- `run-summary.md`
- `run-result.json`

Those files preserve both a quick human summary and the raw per-case record.

## How This Differs From Orion Transport Tests

- Orion transport tests prove packet insertion, no-submit boundaries, and witness evidence on the real mobile surface.
- command-language casework proves or challenges `TTD_COMMAND_V1` language and route behavior.

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
