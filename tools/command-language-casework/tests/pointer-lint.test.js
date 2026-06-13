const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../../..");
const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
const studyDir = path.join(caseworkRoot, "study");
const syncScript = path.join(caseworkRoot, "scripts", "sync-casework-study-status-skill.mjs");

test("sync script lints stale 1-case pointers against 8-case designer skill rule", () => {
  // We will temporarily write a bad study status and see if the sync script fails.
  const statusMdPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.md");
  let originalMd = "";
  if (fs.existsSync(statusMdPath)) {
    originalMd = fs.readFileSync(statusMdPath, "utf8");
  }

  const badMd = `
# Casework Study Status
**Next Study Needed**: test_stale_pointer_v1
**Suite shape recommendation**: One-case cold-first suite in a fresh disposable chat.
**Next action for fresh chat**: Generate only the validator-ready 1 case JSON suite.
`;

  try {
    fs.writeFileSync(statusMdPath, badMd, "utf8");
    let failed = false;
    try {
      execSync(`node "${syncScript}"`, { stdio: "pipe" });
    } catch (err) {
      failed = true;
      const errorText = err.stderr ? err.stderr.toString() : err.message;
      assert.match(errorText, /Casework Study Status Validation Failed/);
      assert.match(errorText, /enforces a minimum suite floor of 8/);
      assert.match(errorText, /test_stale_pointer_v1/);
    }
    assert.ok(failed, "Sync script should throw validation error when given a stale 1-case shape recommendation");
  } finally {
    // Restore
    if (originalMd) {
      fs.writeFileSync(statusMdPath, originalMd, "utf8");
    } else {
      fs.unlinkSync(statusMdPath);
    }
  }
});
