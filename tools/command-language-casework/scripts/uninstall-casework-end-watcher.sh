#!/usr/bin/env bash

set -euo pipefail

WATCHER_PLIST="$HOME/Library/LaunchAgents/com.billy.casework-end-watcher.plist"

if [ -f "$WATCHER_PLIST" ]; then
  echo "Unloading LaunchAgent via launchctl bootout..."
  launchctl bootout gui/$UID "$WATCHER_PLIST" 2>/dev/null || launchctl unload "$WATCHER_PLIST" 2>/dev/null || true
  rm "$WATCHER_PLIST"
  echo "Watcher uninstalled."
else
  echo "Watcher plist not found at $WATCHER_PLIST"
fi
