const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const installerPath = path.resolve(
  __dirname,
  "..",
  "scripts",
  "install-casework-start-command.sh"
);
const installerSource = fs.readFileSync(installerPath, "utf8");
const schemaPath = path.resolve(
  __dirname,
  "..",
  "schema",
  "casework-suite.schema.json"
);
const schemaSource = fs.readFileSync(schemaPath, "utf8");
const runnerSchemaSkillPath = "/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump/library/skills/chatgpt/command-language-casework-runner-schema-skill.md";
const designerSkillPath = "/Users/oflahertys/Desktop/Code Projects/ACTIVE/_worktrees/Billy-Project-Command-Center-main-for-skill-dump/library/skills/chatgpt/command-language-casework-designer-skill.md";

test("installer references local mirror designer, schema, current-study skill, and study status sources", () => {
  assert.match(installerSource, /command-language-casework-designer-skill\.md/);
  assert.match(installerSource, /command-language-casework-runner-schema-skill\.md/);
  assert.match(installerSource, /command-language-casework-current-study-status-skill\.md/);
  assert.match(installerSource, /CASEWORK_STUDY_STATUS\.md/);
  assert.match(installerSource, /Casework Start\.command/);
});

test("installer builds a three-part bundle and strips frontmatter", () => {
  assert.match(installerSource, /strip_frontmatter/);
  assert.match(installerSource, /Part 1 — Casework Designer Skill/);
  assert.match(installerSource, /Part 2 — Casework Runner Schema Skill/);
  assert.match(installerSource, /Part 3 — Casework Current Study Status Skill/);
});

test("installer opens launch-casework.command and avoids deprecated desktop dependencies", () => {
  assert.match(installerSource, /launch-casework\.command/);
  assert.doesNotMatch(installerSource, /shortcuts:\/\//);
  assert.doesNotMatch(installerSource, /script\.google\.com/);
  assert.doesNotMatch(installerSource, /doPost|Apps Script/);
});

test("installer stays clipboard-only and does not touch private browser storage APIs", () => {
  assert.doesNotMatch(installerSource, /click Send|auto-send|submit/i);
  assert.doesNotMatch(installerSource, /document\.cookie/);
  assert.doesNotMatch(installerSource, /localStorage/);
  assert.doesNotMatch(installerSource, /sessionStorage/);
  assert.doesNotMatch(installerSource, /indexedDB/);
  assert.doesNotMatch(installerSource, /navigator\.credentials/);
});

test("schema and bundled skill sources teach packet strings, not packet objects", () => {
  const runnerSchemaSkill = fs.readFileSync(runnerSchemaSkillPath, "utf8");
  const designerSkill = fs.readFileSync(designerSkillPath, "utf8");

  assert.match(schemaSource, /"packet": \{/);
  assert.match(schemaSource, /"type": "string"/);
  assert.match(schemaSource, /Never use a nested object here/);
  assert.match(schemaSource, /escape the inner quotes so the outer suite remains valid JSON/);
  assert.match(runnerSchemaSkill, /`packet` must be a string, never an object/);
  assert.match(runnerSchemaSkill, /exactly one fenced `json` code block/);
  assert.match(runnerSchemaSkill, /escape the inner quotes/);
  assert.match(runnerSchemaSkill, /JSON\.parse/);
  assert.match(runnerSchemaSkill, /TTD_COMMAND_V1\\n/);
  assert.match(designerSkill, /`packet` must be a string, never an object/);
  assert.match(designerSkill, /exactly one fenced `json` code block/);
  assert.match(designerSkill, /Embedded packet JSON inside `packet` must have escaped quotes/);
  assert.match(designerSkill, /parseable JSON/);
  assert.match(designerSkill, /If the GUI says `packet must be a non-empty string`/);
});

test("sync script references study status and mirrored skill path without git mutation", () => {
  const syncPath = path.resolve(
    __dirname,
    "..",
    "scripts",
    "sync-casework-study-status-skill.mjs"
  );
  const syncSource = fs.readFileSync(syncPath, "utf8");

  assert.match(syncSource, /CASEWORK_STUDY_STATUS\.md/);
  assert.match(syncSource, /command-language-casework-current-study-status-skill\.md/);
  assert.match(syncSource, /splitFrontmatter/);
  assert.doesNotMatch(syncSource, /git add|git commit/);
});
