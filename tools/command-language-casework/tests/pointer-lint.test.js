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

  const badMdShape = `
# Casework Study Status
**Next Study Needed**: test_stale_pointer_v1
**Test strategy**: Ensure good test coverage.
**Suite shape recommendation**: One-case cold-first suite in a fresh disposable chat.
**Next action for fresh chat**: Generate only the validator-ready 1 case JSON suite.
`;

  const badMdStrategy = `
# Casework Study Status
**Next Study Needed**: test_stale_strategy_pointer_v1
**Test strategy**: Run one fresh disposable chat with a single cold case.
**Suite shape recommendation**: 8-case minimum contrast suite.
**Next action for fresh chat**: Generate a validator-ready suite with at least 8 cases.
`;

  try {
    fs.writeFileSync(statusMdPath, badMdShape, "utf8");
    let failedShape = false;
    try {
      execSync(`node "${syncScript}"`, { stdio: "pipe" });
    } catch (err) {
      failedShape = true;
      const errorText = err.stderr ? err.stderr.toString() : err.message;
      assert.match(errorText, /Casework Study Status Validation Failed/);
      assert.match(errorText, /enforces a minimum suite floor of 8/);
      assert.match(errorText, /test_stale_pointer_v1/);
    }
    assert.ok(failedShape, "Sync script should throw validation error when given a stale 1-case shape recommendation");

    fs.writeFileSync(statusMdPath, badMdStrategy, "utf8");
    let failedStrategy = false;
    try {
      execSync(`node "${syncScript}"`, { stdio: "pipe" });
    } catch (err) {
      failedStrategy = true;
      const errorText = err.stderr ? err.stderr.toString() : err.message;
      assert.match(errorText, /Casework Study Status Validation Failed/);
      assert.match(errorText, /test_stale_strategy_pointer_v1/);
      assert.match(errorText, /single cold case/);
    }
    assert.ok(failedStrategy, "Sync script should throw validation error when given a stale Test strategy");

    const validMd = `
# Casework Study Status
**Next Study Needed**: route_law_fresh_context_minimum_carrier_isolation_v1_retry_split_8case_suites
**Test strategy**: Generate validator-ready 8-case suites. Every suite contains at least 8 cases. The carrier candidate under test appears at case 001 and the suite is run in a fresh disposable ChatGPT chat. Interpret the case 001 result as clean fresh-context carrier evidence. Cases 002-008 provide tail controls, sanity checks, and carryover observations.
**Suite shape recommendation**: 10 to 12 validator-ready 8-case suites. Every suite starts with a different carrier candidate at case 001, followed by seven support cases. Candidate-first coverage should include protocol marker without route fields, route_id without active_chunk_id, active_chunk_id without route_id, route_id plus active_chunk_id, active_chunk_id plus label without route_id, damaged allowed_intents, wrong-next with active_id, wrong-next without active_id, activation_frame plus route_id plus active_id, and explicit legal_successor sanity.
**Next action for fresh chat**: Generate validator-ready 8-case suite JSON objects with the target carrier candidate at case 001. Avoid wrapper packs. Every suite object must be directly pasteable into the Casework GUI and must contain at least 8 cases.
`;

    fs.writeFileSync(statusMdPath, validMd, "utf8");
    let failedValid = false;
    try {
      execSync(`node "${syncScript}"`, { stdio: "pipe" });
    } catch (err) {
      failedValid = true;
    }
    assert.ok(!failedValid, "Sync script should NOT throw validation error when given valid 8-case wording with case 001 and support cases");

  } finally {
    // Restore
    if (originalMd) {
      fs.writeFileSync(statusMdPath, originalMd, "utf8");
    } else {
      fs.unlinkSync(statusMdPath);
    }
  }
});
