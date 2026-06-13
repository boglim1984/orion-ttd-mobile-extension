#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$TOOL_DIR/../.." && pwd)"
CASEWORK_DESIGN_PROJECT_URL_DEFAULT="https://chatgpt.com/g/g-p-6a2d9ee3c5088191a02e4c72cd5f9f3b/project"
CASEWORK_DESIGN_PROJECT_URL="${CASEWORK_DESIGN_PROJECT_URL:-$CASEWORK_DESIGN_PROJECT_URL_DEFAULT}"
CASEWORK_TEST_CHAT_URL="${CASEWORK_TEST_CHAT_URL:-https://chatgpt.com/}"

DEFAULT_PORT="${1:-45322}"
PORT="$DEFAULT_PORT"

while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

LOG_PATH="/tmp/orion-casework-server-${PORT}.log"
GUI_URL="http://127.0.0.1:${PORT}"
FOCUS_NOTE="Chrome may bring the new tabs forward. Return to the TTD TESTS Project chat after launch."

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
    make new tab with properties {URL:"${CASEWORK_DESIGN_PROJECT_URL}"}
    make new tab with properties {URL:"${GUI_URL}"}
    make new tab with properties {URL:"${CASEWORK_TEST_CHAT_URL}"}
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
  open -g -a "Google Chrome" "$CASEWORK_DESIGN_PROJECT_URL" || open -a "Google Chrome" "$CASEWORK_DESIGN_PROJECT_URL"
  open -g -a "Google Chrome" "$GUI_URL" || open -a "Google Chrome" "$GUI_URL"
  open -g -a "Google Chrome" "$CASEWORK_TEST_CHAT_URL" || open -a "Google Chrome" "$CASEWORK_TEST_CHAT_URL"
fi

SETUP_NOTE=$(
  cat <<EOF
Command Language Casework Launcher
TTD TESTS Project: ${CASEWORK_DESIGN_PROJECT_URL}
GUI: ${GUI_URL}
Disposable ChatGPT test tab: ${CASEWORK_TEST_CHAT_URL}

Mental model:
TTD TESTS Project:
designs/reviews suites using curated testing sources

Casework GUI:
validates JSON and copies runner

Disposable ChatGPT test tab:
executes runner only

Result JSON:
returns to TTD TESTS Project chat for Mermaid review

Current launcher scope:
- This launcher opens the TTD TESTS Project, Casework GUI, and a disposable generic ChatGPT test tab.
- Disposable runner tab stays separate and source-free.

Next steps:
1. Return to the TTD TESTS Project chat and use the copied local mirror bundle there.
2. Ask that chat to design the next casework suite JSON block.
3. Use the GUI Step 2 to load or paste that suite.
4. Validate the suite.
5. Copy the self-contained runner for that suite.
6. In Chrome, open DevTools with Option + Command + I on the disposable ChatGPT test tab.
7. Paste the runner into the console.
8. Click Run in the black overlay on the ChatGPT page.
9. Return the result JSON to the TTD TESTS Project chat, complete the Mermaid-first review, regenerate the case-law matrix, and update study status before designing the next suite.

Server PID: ${SERVER_PID}
Server log: ${LOG_PATH}
${FOCUS_NOTE}
EOF
)

printf "%s\n" "$SETUP_NOTE"
