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
FOCUS_NOTE="Chrome may bring the new tabs forward. Return to your dev chat after launch."

cd "$REPO_DIR"
nohup node tools/command-language-casework/server/casework-server.mjs --port "$PORT" >"$LOG_PATH" 2>&1 &
SERVER_PID=$!

sleep 1

if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  echo "Casework server failed to start. Check ${LOG_PATH}"
  exit 1
fi

open_support_tabs() {
  if command -v osascript >/dev/null 2>&1; then
    osascript <<EOF >/dev/null 2>&1 || return 1
set previousApp to ""
tell application "System Events"
  set frontAppList to application processes whose frontmost is true
  if (count of frontAppList) > 0 then
    set previousApp to name of item 1 of frontAppList
  end if
end tell

tell application "Google Chrome"
  if not running then
    launch
    delay 0.6
  end if
  if (count of windows) = 0 then
    make new window
    delay 0.2
  end if
  tell front window
    make new tab with properties {URL:"${GUI_URL}"}
    make new tab with properties {URL:"${CHATGPT_URL}"}
  end tell
end tell

if previousApp is not "" and previousApp is not "Google Chrome" then
  tell application previousApp to activate
end if
EOF
    return 0
  fi

  return 1
}

if ! open_support_tabs; then
  open -g -a "Google Chrome" "$GUI_URL" || open -a "Google Chrome" "$GUI_URL"
  open -g -a "Google Chrome" "$CHATGPT_URL" || open -a "Google Chrome" "$CHATGPT_URL"
fi

SETUP_NOTE=$(
  cat <<EOF
Command Language Casework Launcher
GUI: ${GUI_URL}
ChatGPT: ${CHATGPT_URL}

Mental model:
Dev chat designs the test suite. Casework GUI validates JSON and copies the runner. Disposable ChatGPT executes the test. Result JSON comes back to the dev chat for Mermaid review.

Next steps:
1. Stay in the dev chat and use the skill bookmarklet there.
2. Ask that chat to design the next casework suite JSON block.
3. Use the GUI Step 2 to load or paste that suite.
4. Validate the suite.
5. Copy the self-contained runner for that suite.
6. In Chrome, open DevTools with Option + Command + I on the disposable ChatGPT tab.
7. Paste the runner into the console.
8. Click Run in the black overlay on the ChatGPT page.

Server PID: ${SERVER_PID}
Server log: ${LOG_PATH}
${FOCUS_NOTE}
EOF
)

printf "%s" "$SETUP_NOTE" | pbcopy
printf "%s\n" "$SETUP_NOTE"
