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

If this status says a scorer/tool issue is open, do not design a new language-boundary suite unless Billy explicitly asks.

After meaningful result review, update this status source from Orion \`CASEWORK_STUDY_STATUS.md\` before the next Desktop launch.

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

if (!fs.existsSync(SOURCE_PATH)) {
  throw new Error(`Study status source not found: ${SOURCE_PATH}`);
}

const sourceText = cleanText(fs.readFileSync(SOURCE_PATH, "utf8"));
const destination = resolveDestinationRoot();
const existingText = cleanText(fs.readFileSync(destination.path, "utf8"));
const { frontmatter } = splitFrontmatter(existingText);
const nextStudy = extractNextStudyLine(sourceText);
const output = `${frontmatter}${buildBody(sourceText)}`;

fs.writeFileSync(destination.path, output, "utf8");

console.log(`Source path: ${SOURCE_PATH}`);
console.log(`Destination path: ${destination.path}`);
console.log(`Bytes written: ${Buffer.byteLength(output, "utf8")}`);
console.log(`Next study line: ${nextStudy}`);
