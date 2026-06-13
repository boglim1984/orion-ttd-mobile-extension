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
Design chat designs the test suite and reviews result JSON. Casework GUI validates JSON, copies the runner, and supports reflection-loop affordances. Disposable ChatGPT executes the test. Result JSON comes back to the design chat for Mermaid-first review.

Current launcher scope:
- This launcher opens the GUI and a disposable ChatGPT tab.
- Open or keep the design chat separately. The launcher does not manage ChatGPT project-chat focus reliably.

Next steps:
1. Stay in the design chat and use the skill bookmarklet there.
2. Ask that chat to design the next casework suite JSON block.
3. Use the GUI Step 2 to load or paste that suite.
4. Validate the suite.
5. Copy the self-contained runner for that suite.
6. In Chrome, open DevTools with Option + Command + I on the disposable ChatGPT tab.
7. Paste the runner into the console.
8. Click Run in the black overlay on the ChatGPT page.
9. Import the result JSON, complete the Mermaid-first review, regenerate the case-law matrix, and update study status before designing the next suite.

Server PID: ${SERVER_PID}
Server log: ${LOG_PATH}
${FOCUS_NOTE}
EOF
)

printf "%s\n" "$SETUP_NOTE"
