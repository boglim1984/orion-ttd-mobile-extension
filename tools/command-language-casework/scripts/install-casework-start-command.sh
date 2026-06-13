#!/bin/bash
set -e

DEST="$HOME/Desktop/Casework Start.command"

echo "Installing Casework Start command to $DEST..."

cat << 'EOF' > "$DEST"
#!/bin/zsh
set -e

LOG="/tmp/orion-casework-start.log"
SKILL="/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump/library/skills/chatgpt/command-language-casework-designer-skill.md"
FALLBACK_SKILL="/Users/oflahertys/Desktop/Code Projects/ACTIVE/Billy-Project-Command-Center/library/skills/chatgpt/command-language-casework-designer-skill.md"
LAUNCHER="/Users/oflahertys/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension/tools/command-language-casework/launch-casework.command"

{
  echo "Casework Start local mirror $(date)"

  if [ ! -f "$SKILL" ]; then
    SKILL="$FALLBACK_SKILL"
  fi

  if [ ! -f "$SKILL" ]; then
    echo "ERROR: skill file not found"
    echo "Tried primary and fallback paths."
    exit 1
  fi

  PAYLOAD="$(/usr/bin/python3 - "$SKILL" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8", errors="replace")

if text.startswith("\ufeff"):
    text = text[1:]

text = text.replace("\r\n", "\n")

lines = text.split("\n")
if lines and lines[0].strip() == "---":
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is not None:
        text = "\n".join(lines[end + 1:]).lstrip()

text = (
    text.replace("‚Üí", "→")
        .replace("‚Äôs", "’s")
        .replace("‚Äú", "“")
        .replace("‚Äù", "”")
)

header = f"""Billy is launching this skill from his local Command Center mirror.

This is a skill activation message, not a capture event.
Do not output the receipt format yet.
Just confirm the skill is loaded, then ask Billy what he wants to do with it.

Skill source: {path}

Treat the skill text below as the active skill for this chat.

"""

print(header + text.strip())
PY
)"

  if printf "%s" "$PAYLOAD" | /usr/bin/grep -q "^---"; then
    echo "ERROR: payload still has YAML frontmatter"
    exit 1
  fi

  if ! printf "%s" "$PAYLOAD" | /usr/bin/grep -q "Command Language Casework Designer Skill"; then
    echo "ERROR: payload missing Casework skill marker"
    exit 1
  fi

  printf "%s" "$PAYLOAD" | /usr/bin/pbcopy
  echo "Copied local mirror payload bytes: $(printf "%s" "$PAYLOAD" | /usr/bin/wc -c)"
  echo "Skill source: $SKILL"

  /usr/bin/open "$LAUNCHER"
  echo "Launcher opened"
} >> "$LOG" 2>&1
EOF

chmod +x "$DEST"
echo "Done. Installed $DEST"
