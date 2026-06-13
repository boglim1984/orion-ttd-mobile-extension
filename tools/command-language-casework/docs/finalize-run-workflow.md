# Casework Finalization Workflow

## Overview
The casework runner executes in a disposable ChatGPT tab. Due to browser security (CSP) restrictions, it cannot directly POST results to the local casework server or save to a specific directory. Instead, the runner automatically downloads the `orion-casework-result-*.json` file to your `~/Downloads` or `~/Desktop` directory.

The **Finalizer Script** automates the entire process of bringing that downloaded evidence into the permanent study record.

## 1. Run the Suite
Use the Casework Start bookmarklet or desktop command to open the launcher and start the suite in ChatGPT. When the suite finishes, the runner overlay will say:
```
Test done.
Result downloaded.
Now run:
tools/command-language-casework/scripts/finalize-latest-casework-run.sh --commit --push
```

## 2. Finalize the Record
From the `orion-ios-ttd-injector/ttd-mobile-extension` root, run:
```bash
tools/command-language-casework/scripts/finalize-latest-casework-run.sh --commit --push
```

This single command will:
1. Auto-discover the latest `orion-casework-result-*.json` in `~/Downloads` or `~/Desktop`.
2. Skip if the run is already imported.
3. Import the raw result and generate the review stub.
4. Regenerate all case-law matrix files, indices, and study status.
5. Sync the Command Center mirrored status skill.
6. Rebuild the Command Center skill index (if needed).
7. Refresh the Casework Start bundle payload.
8. Stage and commit ONLY the specific Casework evidence files (protecting unrelated untracked work).
9. Push the updates to GitHub.
10. Print a clear pointer and GitHub sync report.

### Diagnostics are Built-in
**Do not manually copy diagnostics for successful runs.** 
The downloaded `orion-casework-result-*.json` file already contains the full `dom_turn_trace`, send activation details, and runner diagnostics. The finalizer script permanently stores them in the `study/raw/` evidence folder.

## Troubleshooting

### Finalizer can't find the result
If you downloaded the file to a custom folder instead of `~/Downloads` or `~/Desktop`, you can pass it explicitly:
```bash
tools/command-language-casework/scripts/finalize-latest-casework-run.sh --result path/to/my/downloaded-result.json --commit --push
```

### GitHub out of sync
If you omit the `--push` flag, the finalizer report will warn you:
```
LOCAL UPDATED BUT NOT PUSHED TO GITHUB
Fresh chats that inspect GitHub may see stale status.
```
Simply run `git push` manually in both the Orion and Command Center repos to align them.
