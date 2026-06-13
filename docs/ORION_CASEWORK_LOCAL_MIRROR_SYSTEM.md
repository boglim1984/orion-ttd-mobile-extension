# Orion Casework Local Mirror System

## Purpose

Define the supported desktop v1 Casework start path from local mirrored sources.

## Supported launcher

- `~/Desktop/Casework Start.command`
- installer:
  `tools/command-language-casework/scripts/install-casework-start-command.sh`

## Bundle parts

1. Casework Designer Skill
2. Casework Runner Schema Skill
3. Casework Current Study Status Skill

## Layer boundaries

- Designer Skill:
  how the fresh chat behaves
- Runner Schema Skill:
  what JSON the local runner accepts
- Study Status:
  what study is next and what findings remain open
- Casework GUI:
  validates suites, copies the runner, and records evidence

## Validation and schema rule

- `created_for_tool` is descriptive metadata
- `run_config` is executable and remains strict
- the executable minimum is:

```json
{
  "send_mode": "explicit_casework_run_button",
  "turn_timeout_ms": 1000,
  "stability_wait_ms": 250
}
```

## Study loop

Fresh dev chat → bundle load → next suite design → GUI validation → disposable ChatGPT run → result JSON → study import/tabulation → updated study status.

After meaningful result review, run:

`tools/command-language-casework/scripts/import-tabulate-sync-casework-result.sh`

This imports the result, tabulates Orion study status, mirrors the current study-status skill, and lets the next Desktop bundle carry the updated next-study pointer.

## Safety boundaries

- no auto-send from the start launcher
- no cookies, localStorage, sessionStorage, indexedDB, or credential scraping
- no live GitHub dependency for desktop v1
- no Apps Script dependency for desktop v1
- no macOS Shortcut dependency for desktop v1

## Experimental and demoted paths

- static snapshot bookmarklets are convenience fallbacks and may become stale
- mobile/cloud router paths can exist separately, but they are not the supported desktop v1 source of truth
