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

## Next Action

Run the baseline suite in a disposable ChatGPT test chat, then drop `run-summary.md` and `run-result.json` into a fresh chat loaded with the Command Language Casework Designer Skill.
