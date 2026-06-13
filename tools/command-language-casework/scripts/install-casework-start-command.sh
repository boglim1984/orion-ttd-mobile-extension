#!/bin/bash
set -e

DEST="$HOME/Desktop/Casework Start.command"

echo "Installing Casework Start command to $DEST..."

cat << 'EOF' > "$DEST"
#!/bin/zsh
set -e

LOG="/tmp/orion-casework-start.log"
PRIMARY_CC_ROOT="/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump"
FALLBACK_CC_ROOT="/Users/oflahertys/Desktop/Code Projects/ACTIVE/Billy-Project-Command-Center"
DESIGNER_REL="library/skills/chatgpt/command-language-casework-designer-skill.md"
SCHEMA_REL="library/skills/chatgpt/command-language-casework-runner-schema-skill.md"
STUDY_STATUS="/Users/oflahertys/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension/tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md"
LAUNCHER="/Users/oflahertys/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension/tools/command-language-casework/launch-casework.command"

{
  echo "Casework Start local mirror $(date)"

  DESIGNER="$PRIMARY_CC_ROOT/$DESIGNER_REL"
  if [ ! -f "$DESIGNER" ]; then
    DESIGNER="$FALLBACK_CC_ROOT/$DESIGNER_REL"
  fi

  SCHEMA="$PRIMARY_CC_ROOT/$SCHEMA_REL"
  if [ ! -f "$SCHEMA" ]; then
    SCHEMA="$FALLBACK_CC_ROOT/$SCHEMA_REL"
  fi

  if [ ! -f "$DESIGNER" ]; then
    echo "ERROR: designer skill file not found"
    echo "Tried primary and fallback Command Center paths."
    exit 1
  fi

  PAYLOAD="$(/usr/bin/python3 - "$DESIGNER" "$SCHEMA" "$STUDY_STATUS" <<'PY'
import sys
from pathlib import Path

designer_path = Path(sys.argv[1])
schema_path = Path(sys.argv[2])
study_path = Path(sys.argv[3])


def clean_text(text: str) -> str:
    if text.startswith("\ufeff"):
        text = text[1:]
    text = text.replace("\r\n", "\n")
    return (
        text.replace("‚Üí", "→")
            .replace("‚Äôs", "’s")
            .replace("‚Äú", "“")
            .replace("‚Äù", "”")
    )


def strip_frontmatter(text: str) -> str:
    lines = text.split("\n")
    if lines and lines[0].strip() == "---":
        end = None
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                end = i
                break
        if end is not None:
            text = "\n".join(lines[end + 1:]).lstrip()
    return text


def load_skill_body(path: Path) -> str:
    return strip_frontmatter(clean_text(path.read_text(encoding="utf-8", errors="replace"))).strip()


designer_body = load_skill_body(designer_path)
parts = []
warnings = []

parts.append("# Part 1 — Casework Designer Skill\n\n" + designer_body)

if schema_path.exists():
    schema_body = load_skill_body(schema_path)
    parts.append("# Part 2 — Casework Runner Schema Skill\n\n" + schema_body)
else:
    warnings.append(f"WARNING: schema skill file missing at {schema_path}")
    parts.append("# Part 2 — Casework Runner Schema Skill\n\n" + warnings[-1])

if study_path.exists():
    study_body = clean_text(study_path.read_text(encoding="utf-8", errors="replace")).strip()
    parts.append("# Part 3 — Casework Study Status\n\n" + study_body)
else:
    warnings.append(f"WARNING: study status file missing at {study_path}")
    parts.append("# Part 3 — Casework Study Status\n\n" + warnings[-1])

header = f"""Billy is launching Casework from the local Command Center mirror.

This is a skill activation message, not a capture event.
Do not output the receipt format yet.
Use the bundled Designer Skill, Runner Schema, and Study Status as active context for this chat.

Part 1 is the operating skill.
Part 2 is the current executable schema.
Part 3 is the current study status.

Ask Billy what he wants to do next after confirming the bundle is loaded.

"""

payload = header + "\n\n".join(parts).strip() + "\n"

for warning in warnings:
    print(f"[bundle-warning] {warning}", file=sys.stderr)

print(payload)
PY
)"

  if ! printf "%s" "$PAYLOAD" | /usr/bin/grep -q "Part 1 — Casework Designer Skill"; then
    echo "ERROR: payload missing Part 1"
    exit 1
  fi

  if ! printf "%s" "$PAYLOAD" | /usr/bin/grep -q "Part 2 — Casework Runner Schema Skill"; then
    echo "ERROR: payload missing Part 2"
    exit 1
  fi

  if ! printf "%s" "$PAYLOAD" | /usr/bin/grep -q "Part 3 — Casework Study Status"; then
    echo "ERROR: payload missing Part 3"
    exit 1
  fi

  printf "%s" "$PAYLOAD" | /usr/bin/pbcopy
  echo "Copied local mirror payload bytes: $(printf "%s" "$PAYLOAD" | /usr/bin/wc -c)"
  echo "Designer source: $DESIGNER"
  echo "Schema source: $SCHEMA"
  echo "Study status source: $STUDY_STATUS"

  /usr/bin/open "$LAUNCHER"
  echo "Launcher opened"
} >> "$LOG" 2>&1
EOF

chmod +x "$DEST"
echo "Done. Installed $DEST"
