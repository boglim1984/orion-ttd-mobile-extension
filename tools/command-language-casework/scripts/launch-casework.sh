#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$TOOL_DIR/../.." && pwd)"

DEFAULT_PORT="${1:-45322}"
PORT="$DEFAULT_PORT"

while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

LOG_PATH="/tmp/orion-casework-server-${PORT}.log"
GUI_URL="http://127.0.0.1:${PORT}"
CHATGPT_URL="https://chatgpt.com/"

cd "$REPO_DIR"
nohup node tools/command-language-casework/server/casework-server.mjs --port "$PORT" >"$LOG_PATH" 2>&1 &
SERVER_PID=$!

sleep 1

if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  echo "Casework server failed to start. Check ${LOG_PATH}"
  exit 1
fi

open -a "Google Chrome" "$GUI_URL"
open -a "Google Chrome" "$CHATGPT_URL"

SETUP_NOTE=$(
  cat <<EOF
Command Language Casework Launcher
GUI: ${GUI_URL}
ChatGPT: ${CHATGPT_URL}

Next steps:
1. Use the GUI Step 2 to load or paste a suite.
2. Validate the suite.
3. Copy the self-contained runner for that suite.
4. In Chrome, open DevTools with Option + Command + I on the disposable ChatGPT tab.
5. Paste the runner into the console.
6. Click Run in the black overlay on the ChatGPT page.

Server PID: ${SERVER_PID}
Server log: ${LOG_PATH}
EOF
)

printf "%s" "$SETUP_NOTE" | pbcopy
printf "%s\n" "$SETUP_NOTE"
