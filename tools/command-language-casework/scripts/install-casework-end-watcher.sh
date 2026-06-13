#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WATCHER_PLIST="$HOME/Library/LaunchAgents/com.billy.casework-end-watcher.plist"
NODE_PATH="$(which node)"

if [ -z "$NODE_PATH" ]; then
  echo "Error: Could not find node executable."
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"

cat << PLIST > "$WATCHER_PLIST"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.billy.casework-end-watcher</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$SCRIPT_DIR/casework-end-watch-loop.mjs</string>
    </array>
    <key>WatchPaths</key>
    <array>
        <string>$HOME/Downloads</string>
        <string>$HOME/Desktop</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
PLIST

echo "Loading LaunchAgent via launchctl bootstrap..."
launchctl bootstrap gui/$UID "$WATCHER_PLIST" || launchctl load "$WATCHER_PLIST"

echo "Watcher installed and loaded: $WATCHER_PLIST"
