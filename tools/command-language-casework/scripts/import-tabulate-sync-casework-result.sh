#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CC_WORKTREE="/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump"
STATUS_PATH="$REPO_ROOT/tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md"
SYNC_SCRIPT="$REPO_ROOT/tools/command-language-casework/scripts/sync-casework-study-status-skill.mjs"

pick_latest_result() {
  find "$HOME/Desktop" "$HOME/Downloads" -name "orion-casework-result-*.json" -print 2>/dev/null | sort | tail -1
}

RESULT_PATH="${1:-}"
if [ -z "$RESULT_PATH" ]; then
  RESULT_PATH="$(pick_latest_result)"
fi

if [ -z "$RESULT_PATH" ] || [ ! -f "$RESULT_PATH" ]; then
  echo "ERROR: No casework result JSON found."
  exit 1
fi

cd "$REPO_ROOT"
node tools/command-language-casework/scripts/import-casework-result.mjs "$RESULT_PATH"
node tools/command-language-casework/scripts/tabulate-casework-study.mjs
node tools/command-language-casework/scripts/sync-casework-study-status-skill.mjs

cd "$CC_WORKTREE"
python3 scripts/build_skill_index.py >/dev/null

PLACEHOLDER_MATCHES="$(grep -R -n "Add notes\|What should the next suite test\|Only propose the next suite" "$REPO_ROOT/tools/command-language-casework/study/reviews" || true)"
if [ -n "$PLACEHOLDER_MATCHES" ]; then
  echo "ERROR: Placeholder reflection text still present after import/tabulate sync."
  echo "$PLACEHOLDER_MATCHES"
  exit 1
fi

echo "Imported result path: $RESULT_PATH"
echo "Tabulation complete"
echo "Mirrored study-status skill path: $CC_WORKTREE/library/skills/chatgpt/command-language-casework-current-study-status-skill.md"
echo "Current CASEWORK_STUDY_STATUS.md head:"
sed -n '1,20p' "$STATUS_PATH"
echo "Orion git status short for study files:"
git -C "$REPO_ROOT" status --short -- tools/command-language-casework/study
echo "Command Center git status short for skill/index files:"
git -C "$CC_WORKTREE" status --short -- library/skills/chatgpt/command-language-casework-current-study-status-skill.md library/skills/chatgpt/command-language-casework-designer-skill.md library/skills/SKILL_INDEX.json library/skills/SKILL_INDEX.md library/skills/MISSING_HEADERS.md
