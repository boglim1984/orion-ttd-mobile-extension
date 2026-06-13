#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
DESKTOP_PATH="$HOME/Desktop/Casework End.command"

cat << 'CMD' > "$DESKTOP_PATH"
#!/usr/bin/env bash
# Casework End Launcher

REPO_ROOT="REPLACE_ME_REPO_ROOT"
cd "$REPO_ROOT" || { echo "Failed to cd to $REPO_ROOT"; read -p "Press Enter to exit"; exit 1; }

echo "==================================="
echo " CASEWORK END"
echo "==================================="

# Clear screen after short pause so Billy sees it started
sleep 0.5
clear

tools/command-language-casework/scripts/finalize-latest-casework-run.sh --commit --push

echo ""
read -p "Press Enter to close this window..."
CMD

sed -i '' "s|REPLACE_ME_REPO_ROOT|$REPO_ROOT|g" "$DESKTOP_PATH"
chmod +x "$DESKTOP_PATH"

echo "Installed: $DESKTOP_PATH"
