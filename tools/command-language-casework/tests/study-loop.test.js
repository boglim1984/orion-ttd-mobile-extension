const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../../..");
const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
const studyDir = path.join(caseworkRoot, "study");

// Helpers
function makeFakeResult(suiteId, runId) {
  return {
    suite_id: suiteId,
    run_id: runId,
    cases: [
      {
        case_id: "case-01",
        classification: "PASS_EXPECTED_BEHAVIOR",
        case_status: "SUCCESS"
      }
    ]
  };
}

test("study loop - import and tabulate", (t) => {
  const testSuiteId = "test-loop-suite";
  const testRunId = "20260613-120000";
  const fakeResultPath = path.join(__dirname, "fake-result.json");
  
  // 1. Create a fake result JSON
  fs.writeFileSync(fakeResultPath, JSON.stringify(makeFakeResult(testSuiteId, testRunId)), "utf8");

  // 2. Import it
  const importScript = path.join(caseworkRoot, "scripts", "import-casework-result.mjs");
  try {
    execSync(`node "${importScript}" "${fakeResultPath}"`, { stdio: "ignore" });
  } catch (err) {
    assert.fail(`Import script failed: ${err.message}`);
  }

  // 3. Verify it was imported
  const importedFile = path.join(studyDir, "raw", "2026-06-13", `${testSuiteId}__${testRunId}.json`);
  assert.ok(fs.existsSync(importedFile), "Imported file should exist");
  
  // 4. Run tabulate
  const tabulateScript = path.join(caseworkRoot, "scripts", "tabulate-casework-study.mjs");
  try {
    execSync(`node "${tabulateScript}"`, { stdio: "ignore" });
  } catch (err) {
    assert.fail(`Tabulate script failed: ${err.message}`);
  }

  // 5. Verify indexes
  const runIndex = JSON.parse(fs.readFileSync(path.join(studyDir, "index", "CASEWORK_RUN_INDEX.json"), "utf8"));
  const foundRun = runIndex.find(r => r.suite_id === testSuiteId && r.run_id === testRunId);
  assert.ok(foundRun, "Tabulated run index should contain the test run");

  // 6. Verify status preserves manual fields
  const statusObj = JSON.parse(fs.readFileSync(path.join(studyDir, "CASEWORK_STUDY_STATUS.json"), "utf8"));
  assert.strictEqual(statusObj.manual_next_study.next_study_needed, "scorer_keyword_extraction_v1", "Manual next study should be preserved");
  assert.strictEqual(statusObj.computed_summary.latest_suite_id, testSuiteId, "Computed summary should update latest_suite_id");

  // Cleanup
  fs.unlinkSync(fakeResultPath);
  fs.unlinkSync(importedFile);
  fs.unlinkSync(path.join(studyDir, "reviews", "2026-06-13", `${testSuiteId}__${testRunId}.md`));
  // remove the folder if empty
  try {
    fs.rmdirSync(path.join(studyDir, "raw", "2026-06-13"));
    fs.rmdirSync(path.join(studyDir, "reviews", "2026-06-13"));
  } catch(e) {}
  
  // Tabulate again to clean index
  execSync(`node "${tabulateScript}"`, { stdio: "ignore" });
});
