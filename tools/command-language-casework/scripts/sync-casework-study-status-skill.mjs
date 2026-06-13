import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORION_REPO_ROOT = path.resolve(TOOL_ROOT, "..", "..");
const SOURCE_PATH = path.join(TOOL_ROOT, "study", "CASEWORK_STUDY_STATUS.md");
const PRIMARY_CC_ROOT = "/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump";
const FALLBACK_CC_ROOT = "/Users/oflahertys/Desktop/Code Projects/ACTIVE/Billy-Project-Command-Center";
const RELATIVE_DEST = path.join("library", "skills", "chatgpt", "command-language-casework-current-study-status-skill.md");

function cleanText(text) {
  let next = text.replace(/\r\n/g, "\n");
  if (next.startsWith("\ufeff")) {
    next = next.slice(1);
  }
  return next
    .replaceAll("‚Üí", "→")
    .replaceAll("‚Äôs", "’s")
    .replaceAll("‚Äú", "“")
    .replaceAll("‚Äù", "”");
}

function splitFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return { frontmatter: "", body: text.trimStart() };
  }

  const lines = text.split("\n");
  let end = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      end = index;
      break;
    }
  }

  if (end === -1) {
    return { frontmatter: "", body: text.trimStart() };
  }

  return {
    frontmatter: `${lines.slice(0, end + 1).join("\n")}\n`,
    body: lines.slice(end + 1).join("\n").trimStart()
  };
}

function resolveDestinationRoot() {
  const primaryPath = path.join(PRIMARY_CC_ROOT, RELATIVE_DEST);
  if (fs.existsSync(primaryPath)) {
    return { root: PRIMARY_CC_ROOT, path: primaryPath };
  }

  const fallbackPath = path.join(FALLBACK_CC_ROOT, RELATIVE_DEST);
  if (fs.existsSync(fallbackPath)) {
    return { root: FALLBACK_CC_ROOT, path: fallbackPath };
  }

  throw new Error(
    [
      "Command Center current-study-status skill destination is missing.",
      `Expected one of:`,
      `- ${primaryPath}`,
      `- ${fallbackPath}`
    ].join("\n")
  );
}

function extractNextStudyLine(statusText) {
  const match = statusText.match(/^\*\*Next Study Needed\*\*:\s*(.+)$/m);
  return match ? match[1].trim() : "not detected";
}

function buildBody(statusText) {
  const syncedAt = new Date().toISOString();
  return `# Command Language Casework Current Study Status Skill

Status: active source skill  
Owner: Billy / ChatGPT  
Purpose: Provide the bundled current Command Language Casework study status and next-study pointer to fresh chats.

## Purpose

This source is the current Command Language Casework study status.

Use it as bundled context for the Casework Designer Skill.

Do not design from memory if this source contains a next-study pointer.

Treat the manual next-study pointer as an agenda launch brief, not as a research brain.

If Billy asks what to test next, inspect the mirrored status, recent reviews, case-law matrix, case index, run index, and evidence digest before outputting runnable JSON.

If this status says a scorer/tool issue is open, do not design a new language-boundary suite unless Billy explicitly asks.

After meaningful result review, update this status source from Orion \`CASEWORK_STUDY_STATUS.md\` before the next Desktop launch.

Fresh-chat rule:

- Research-planning mode: inspect evidence, compare candidate next studies, recommend the strongest next brief, and do not output JSON unless Billy asks for a suite.
- Runner-output mode: output validator-ready JSON only after the evidence review and pointer check are done.

Helpful Orion study artifacts:

- \`tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md\`
- \`tools/command-language-casework/study/CASEWORK_EVIDENCE_DIGEST.md\`
- \`tools/command-language-casework/study/index/CASEWORK_RUN_INDEX.json\`
- \`tools/command-language-casework/study/index/CASEWORK_CASE_INDEX.csv\`
- \`tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.md\`

## Mirror source

Source path:

\`${SOURCE_PATH}\`

Synced at:

\`${syncedAt}\`

Mirrored for Desktop bundle use from the local Command Center worktree.

## Mirrored CASEWORK_STUDY_STATUS.md

${statusText.trim()}
`;
}

function validatePointerAgainstDesignerSkill(statusText, ccRoot) {
  const designerSkillPath = path.join(ccRoot, "library", "skills", "chatgpt", "command-language-casework-designer-skill.md");
  if (!fs.existsSync(designerSkillPath)) {
    return;
  }
  
  const designerSkillText = fs.readFileSync(designerSkillPath, "utf8");
  
  // Detect if Designer Skill enforces a minimum floor
  const floorMatch = designerSkillText.match(/minimum absolute floor:\s*(\d+)/i);
  if (!floorMatch) {
    return;
  }
  
  const minimumFloor = parseInt(floorMatch[1], 10);
  if (minimumFloor < 8) {
    return; // No strict 8+ rule found
  }
  
  // Extract pointer fields to check
  const shapeMatch = statusText.match(/\*\*Suite shape recommendation\*\*:\s*(.+)$/m);
  const actionMatch = statusText.match(/\*\*Next action for fresh chat\*\*:\s*(.+)$/m);
  
  const shapeText = shapeMatch ? shapeMatch[1] : "";
  const actionText = actionMatch ? actionMatch[1] : "";
  const combinedText = (shapeText + " " + actionText).toLowerCase();
  
  // Detect stale "small case" wording
  const staleRegex = /\b(?:one|1|single|two|2|three|3|four|4|five|5|six|6|seven|7)\b\s*-?\s*cases?/i;
  
  if (staleRegex.test(combinedText)) {
    const pointerMatch = statusText.match(/\*\*Next Study Needed\*\*:\s*(.+)$/m);
    const pointerId = pointerMatch ? pointerMatch[1] : "unknown";
    
    throw new Error(`
Casework Study Status Validation Failed:
The active Designer Skill enforces a minimum suite floor of ${minimumFloor} cases.
However, the current manual pointer text contains stale shape recommendations (e.g., "one-case", "< 8 cases").

Pointer ID: ${pointerId}
Stale text detected in shape/action fields:
  Shape:  ${shapeText}
  Action: ${actionText}

The pointer target itself may still be valid, but you must update the suite_shape_recommendation
and next_action_for_fresh_chat in CASEWORK_STUDY_STATUS.json to respect the active ${minimumFloor}-case rule before bundling.
`);
  }
}

if (!fs.existsSync(SOURCE_PATH)) {
  throw new Error(`Study status source not found: ${SOURCE_PATH}`);
}

const sourceText = cleanText(fs.readFileSync(SOURCE_PATH, "utf8"));
const destination = resolveDestinationRoot();

// Run validation against Designer Skill
validatePointerAgainstDesignerSkill(sourceText, destination.root);

const existingText = cleanText(fs.readFileSync(destination.path, "utf8"));
const { frontmatter } = splitFrontmatter(existingText);
const nextStudy = extractNextStudyLine(sourceText);
const output = `${frontmatter}${buildBody(sourceText)}`;

fs.writeFileSync(destination.path, output, "utf8");

console.log(`Source path: ${SOURCE_PATH}`);
console.log(`Destination path: ${destination.path}`);
console.log(`Bytes written: ${Buffer.byteLength(output, "utf8")}`);
console.log(`Next study line: ${nextStudy}`);
