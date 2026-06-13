# Casework Finalization Workflow

## Overview
The finalizer automation processes completed browser results, ensuring durable records, study tabulation, Command Center skill synchronization, and Git lifecycle.

## Expected Final Workflow
1. Run a Casework test in ChatGPT using the disposable GUI.
2. The browser automatically downloads `orion-casework-result-*.json`.
3. The background watcher detects the new file, ensures it is fully downloaded, and automatically opens a Terminal window running `Casework End`.
4. The test chat output presents a `CASEWORK_REVIEW_V1` block containing the analysis and new pointer direction.
5. Paste this review block into the paused Casework End terminal.
6. The finalizer completes import, validation, pointer updates, bundle generation, scoped commits, and push to GitHub.

## Fallback / Manual Launch
If the automatic watcher does not launch or you accidentally closed the Terminal before pasting the review block, simply double-click the Desktop launcher:
`~/Desktop/Casework End.command`

The script will re-detect the latest downloaded result or gracefully handle an already-imported result by resuming the review capture phase.

## Installation
The automation consists of a LaunchAgent watcher and a Desktop command.
```bash
tools/command-language-casework/scripts/install-casework-end-command.sh
tools/command-language-casework/scripts/install-casework-end-watcher.sh
```

## Disabling the Watcher
If you want to stop automatic pop-ups, unload the LaunchAgent:
```bash
tools/command-language-casework/scripts/uninstall-casework-end-watcher.sh
```

## Logs and State
- **Logs:** `study/logs/casework-end-watcher.log` records file detection and Terminal spawns.
- **State:** `study/.finalizer-watch-state.json` tracks whether a specific suite/run has been launched or completed. This debounces launchd events.
- **Lockfile:** `study/.casework-finalizer.lock` ensures multiple Terminal processes don't race to finalize the same records concurrently.
