const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../../..");
const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
const studyDir = path.join(caseworkRoot, "study");

// Helpers
function makeFakeResult(suiteId, runId, cases) {
  return {
    suite_id: suiteId,
    run_id: runId,
    cases: cases || [
      {
        case_id: "case-01",
        classification: "PASS_EXPECTED_BEHAVIOR",
        case_status: "SUCCESS"
      }
    ]
  };
}

test("study loop - import and tabulate with various classification fields", (t) => {
  const testSuiteId = "test-loop-suite";
  const testRunId = "20260613-120000";
  const fakeResultPath = path.join(__dirname, "fake-result.json");
  
  // 1. Create a fake result JSON
  const cases = [
    { case_id: "c1", classification: "explicit_class", case_status: "st1" },
    { case_id: "c2", heuristic_classification: "heuristic_class", status: "st2" },
    { case_id: "c3", tool_failure_label: "tool_fail_class", caseStatus: "st3" },
    { case_id: "c4", title: "no_class_fields_so_unknown" }
  ];
  fs.writeFileSync(fakeResultPath, JSON.stringify(makeFakeResult(testSuiteId, testRunId, cases)), "utf8");

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

  // Check classification counts
  assert.strictEqual(foundRun.classification_counts["explicit_class"], 1);
  assert.strictEqual(foundRun.classification_counts["heuristic_class"], 1);
  assert.strictEqual(foundRun.classification_counts["tool_fail_class"], 1);
  assert.strictEqual(foundRun.classification_counts["UNKNOWN"], 1);

  // Check status counts
  assert.strictEqual(foundRun.status_counts["st1"], 1);
  assert.strictEqual(foundRun.status_counts["st2"], 1);
  assert.strictEqual(foundRun.status_counts["st3"], 1);
  assert.strictEqual(foundRun.status_counts["UNKNOWN"], 1);

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
