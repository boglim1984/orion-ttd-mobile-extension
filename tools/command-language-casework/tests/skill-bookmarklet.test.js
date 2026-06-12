const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

async function loadBookmarkletModule() {
  const modulePath = path.resolve(
    __dirname,
    "..",
    "public",
    "casework-skill-setup.js"
  );
  return import(modulePath);
}

test("skill bookmarklet keeps the Casework Designer Skill boundaries", async () => {
  const skillSetup = await loadBookmarkletModule();
  const bookmarklet = skillSetup.buildSkillBookmarklet();

  assert.match(bookmarklet, /^javascript:/);
  assert.match(bookmarklet, /Casework Skill Ready/);
  assert.match(bookmarklet, /design the next casework suite/i);
  assert.match(bookmarklet, /Use the Casework GUI tab to run it\./);
  assert.doesNotMatch(bookmarklet, /\/api\/runner\/bootstrap\.js/);
  assert.doesNotMatch(bookmarklet, /fetch\("http:\/\/127\.0\.0\.1/);
  assert.doesNotMatch(bookmarklet, /document\.cookie/);
  assert.doesNotMatch(bookmarklet, /localStorage/);
  assert.doesNotMatch(bookmarklet, /sessionStorage/);
  assert.doesNotMatch(bookmarklet, /indexedDB/);
  assert.doesNotMatch(bookmarklet, /navigator\.credentials/);
  assert.doesNotMatch(bookmarklet, /\.click\(/);
});

test("skill prompt stays compact and points at the supported local workflow", async () => {
  const skillSetup = await loadBookmarkletModule();

  assert.match(skillSetup.CASEWORK_SKILL_PROMPT, /Command Language Casework Designer Skill/);
  assert.match(skillSetup.CASEWORK_SKILL_PROMPT, /review result JSON with a Mermaid diagram first/i);
  assert.match(skillSetup.CASEWORK_SKILL_PROMPT, /Load example -> Validate -> Copy Runner -> paste in ChatGPT console -> click Run -> paste result back here\./);
});

test("launcher script prints GUI URL and quiet-focus limitation", () => {
  const launcherPath = path.resolve(
    __dirname,
    "..",
    "scripts",
    "launch-casework.sh"
  );
  const launcherSource = fs.readFileSync(launcherPath, "utf8");

  assert.match(launcherSource, /GUI: \$\{GUI_URL\}/);
  assert.match(launcherSource, /ChatGPT: \$\{CHATGPT_URL\}/);
  assert.match(launcherSource, /Chrome may bring the new tabs forward\. Return to your dev chat after launch\./);
});
