const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../../..");
const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
const studyDir = path.join(caseworkRoot, "study");
const liveStatusPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.json");

function readLiveNextStudyNeeded() {
  return JSON.parse(fs.readFileSync(liveStatusPath, "utf8")).manual_next_study.next_study_needed;
}

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
  const expectedNextStudy = readLiveNextStudyNeeded();
  
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
  
  const reviewStubPath = path.join(studyDir, "reviews", "2026-06-13", `${testSuiteId}__${testRunId}.md`);
  assert.ok(fs.existsSync(reviewStubPath), "Review stub should exist");
  const reviewContent = fs.readFileSync(reviewStubPath, "utf8");
  assert.match(reviewContent, /- \*\*explicit_class\*\*: 1/);
  assert.match(reviewContent, /- \*\*heuristic_class\*\*: 1/);
  assert.match(reviewContent, /- \*\*tool_fail_class\*\*: 1/);
  assert.match(reviewContent, /- \*\*UNKNOWN\*\*: 1/);
  assert.match(reviewContent, /## Mermaid-first Review/);
  assert.doesNotMatch(reviewContent, /Add notes on the most important pass/i);
  assert.doesNotMatch(reviewContent, /What should the next suite test/i);
  
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

  // Check classification counts under deterministic recompute
  const classificationTotal = Object.values(foundRun.classification_counts).reduce((sum, value) => sum + value, 0);
  assert.strictEqual(classificationTotal, 4);
  assert.strictEqual(foundRun.classification_counts["tool_fail_class"], 1);

  // Check status counts
  assert.strictEqual(foundRun.status_counts["st1"], 1);
  assert.strictEqual(foundRun.status_counts["st2"], 1);
  assert.strictEqual(foundRun.status_counts["st3"], 1);
  assert.strictEqual(foundRun.status_counts["UNKNOWN"], 1);
  assert.ok(foundRun.legal_verdict, "Run index should include legal_verdict");
  assert.ok(foundRun.route_survival_outcome, "Run index should include route_survival_outcome");

  const caseIndexCsv = fs.readFileSync(path.join(studyDir, "index", "CASEWORK_CASE_INDEX.csv"), "utf8");
  assert.match(caseIndexCsv, /legal_verdict/);
  assert.match(caseIndexCsv, /route_survival_outcome/);
  assert.match(caseIndexCsv, /suite_case_count/);
  assert.match(caseIndexCsv, /suite_design_type/);
  assert.match(caseIndexCsv, /case_order/);
  assert.match(caseIndexCsv, /approximate_chat_turn_depth_before_case/);

  // 6. Verify status preserves manual fields
  const statusObj = JSON.parse(fs.readFileSync(path.join(studyDir, "CASEWORK_STUDY_STATUS.json"), "utf8"));
  if (expectedNextStudy === "route_law_language_expansion_v1") {
    assert.strictEqual(
      statusObj.manual_next_study.next_study_needed,
      "route_law_contract_relaxation_matrix_v1",
      "Tabulation should retire the weaker route-law expansion pointer into the stronger contrast brief"
    );
  } else {
    assert.strictEqual(
      statusObj.manual_next_study.next_study_needed,
      expectedNextStudy,
      "Tabulation should preserve the current manual next-study pointer"
    );
  }
  assert.strictEqual(statusObj.computed_summary.latest_suite_id, testSuiteId, "Computed summary should update latest_suite_id");
  assert.strictEqual(statusObj.computed_summary.latest_run_id, testRunId, "Computed summary should update latest_run_id");
  assert.ok(
    !statusObj.open_findings.some((finding) => finding.finding_id === "scorer_collect_dishes_false_lost_route_001"),
    "Resolved scorer collect_dishes finding should not remain open"
  );
  assert.ok(statusObj.manual_next_study.suite_shape_recommendation, "Manual next study should carry suite shape guidance");

  const openFindingsMd = fs.readFileSync(path.join(studyDir, "index", "CASEWORK_OPEN_FINDINGS.md"), "utf8");
  assert.doesNotMatch(openFindingsMd, /scorer_collect_dishes_false_lost_route_001/);

  const evidenceDigest = fs.readFileSync(path.join(studyDir, "CASEWORK_EVIDENCE_DIGEST.md"), "utf8");
  assert.match(evidenceDigest, /Casework Evidence Digest/);
  assert.match(evidenceDigest, /Planning rule/);

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

test("tabulation recomputes legacy scorer rows from current heuristics", () => {
  const testSuiteId = "legacy-scorer-recompute";
  const testRunId = "20260613-121500";
  const fakeResultPath = path.join(__dirname, "legacy-scorer-recompute.json");
  const importedFile = path.join(studyDir, "raw", "2026-06-13", `${testSuiteId}__${testRunId}.json`);
  const reviewStubPath = path.join(studyDir, "reviews", "2026-06-13", `${testSuiteId}__${testRunId}.md`);
  const tabulateScript = path.join(caseworkRoot, "scripts", "tabulate-casework-study.mjs");

  const legacyCase = {
    case_id: "legacy_collect_dishes_only",
    title: "Legacy underscore-only collect dishes",
    classification: "FAIL_LOST_ROUTE",
    case_status: "RESPONDED",
    packet_sent: `TTD_COMMAND_V1\n${JSON.stringify({
      route_id: "desk-reset-v0",
      active_chunk_id: "clear_trash",
      active_chunk_label: "clear trash"
    })}`,
    assistant_responses: ["New active chunk: collect_dishes."],
    visible_turn_text: "New active chunk: collect_dishes.",
    scripted_user_replies_sent: ["move_on"],
    observed_chunks_or_keywords: ["move_on"],
    expected_behavior: [
      "Assistant advances exactly one chunk and visible text contains collect_dishes."
    ],
    forbidden_behavior: [
      "Assistant names stack_papers as the next chunk."
    ]
  };

  fs.writeFileSync(fakeResultPath, JSON.stringify(makeFakeResult(testSuiteId, testRunId, [legacyCase])), "utf8");

  try {
    execSync(`node "${path.join(caseworkRoot, "scripts", "import-casework-result.mjs")}" "${fakeResultPath}"`, { stdio: "ignore" });
    execSync(`node "${tabulateScript}"`, { stdio: "ignore" });

    const caseIndexCsv = fs.readFileSync(path.join(studyDir, "index", "CASEWORK_CASE_INDEX.csv"), "utf8");
    assert.match(caseIndexCsv, /legacy-scorer-recompute/);
    assert.match(caseIndexCsv, /collect_dishes/);
    assert.match(caseIndexCsv, /PASS_CANDIDATE/);
  } finally {
    fs.unlinkSync(fakeResultPath);
    if (fs.existsSync(importedFile)) {
      fs.unlinkSync(importedFile);
    }
    if (fs.existsSync(reviewStubPath)) {
      fs.unlinkSync(reviewStubPath);
    }
    try {
      fs.rmdirSync(path.join(studyDir, "raw", "2026-06-13"));
      fs.rmdirSync(path.join(studyDir, "reviews", "2026-06-13"));
    } catch (_error) {}
    execSync(`node "${tabulateScript}"`, { stdio: "ignore" });
  }
});

test("tabulation status markdown no longer points at reflection-loop validation", () => {
  const tabulateScript = path.join(caseworkRoot, "scripts", "tabulate-casework-study.mjs");
  const expectedNextStudy = readLiveNextStudyNeeded();
  execSync(`node "${tabulateScript}"`, { stdio: "ignore" });

  const statusMd = fs.readFileSync(path.join(studyDir, "CASEWORK_STUDY_STATUS.md"), "utf8");
  assert.match(
    statusMd,
    new RegExp(`Next Study Needed\\*\\*: ${expectedNextStudy.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`)
  );
  assert.doesNotMatch(statusMd, /casework_reflection_loop_v1_validation/);
  assert.doesNotMatch(
    statusMd,
    /\*\*scorer_collect_dishes_false_lost_route_001\*\* \(open\)/,
    "Resolved scorer finding should not remain open in status markdown"
  );
  assert.doesNotMatch(
    statusMd,
    /\*\*Next Study Needed\*\*: scorer_keyword_extraction_v3_fresh_validation/,
    "Completed scorer v3 agenda should not remain the active manual next-study pointer"
  );
  assert.match(statusMd, /\*\*Suite shape recommendation\*\*:/);
  assert.match(statusMd, /\*\*Open gap\*\*:/);
});

test("tabulation latest run ordering respects chronological imported_at", () => {
  const tabulateScript = path.join(caseworkRoot, "scripts", "tabulate-casework-study.mjs");
  const importScript = path.join(caseworkRoot, "scripts", "import-casework-result.mjs");
  
  const olderSuiteId = "older_suite";
  const olderRunId = "20260613-140000";
  const newerSuiteId = "newer_suite";
  const newerRunId = "20260613-150000";
  const alphabeticallyLateSuiteId = "z_alpha_late_suite";
  const alphabeticallyLateRunId = "20260613-130000";

  const olderResultPath = path.join(__dirname, "older-result.json");
  const newerResultPath = path.join(__dirname, "newer-result.json");
  const alphaResultPath = path.join(__dirname, "alpha-result.json");

  fs.writeFileSync(olderResultPath, JSON.stringify(makeFakeResult(olderSuiteId, olderRunId, [])), "utf8");
  fs.writeFileSync(newerResultPath, JSON.stringify(makeFakeResult(newerSuiteId, newerRunId, [])), "utf8");
  fs.writeFileSync(alphaResultPath, JSON.stringify(makeFakeResult(alphabeticallyLateSuiteId, alphabeticallyLateRunId, [])), "utf8");

  try {
    execSync(`node "${importScript}" "${olderResultPath}"`, { stdio: "ignore" });
    execSync(`node "${importScript}" "${newerResultPath}"`, { stdio: "ignore" });
    execSync(`node "${importScript}" "${alphaResultPath}"`, { stdio: "ignore" });

    execSync(`node "${tabulateScript}"`, { stdio: "ignore" });

    const statusObj = JSON.parse(fs.readFileSync(path.join(studyDir, "CASEWORK_STUDY_STATUS.json"), "utf8"));
    
    assert.strictEqual(statusObj.computed_summary.latest_suite_id, newerSuiteId, "Latest suite should be the newest by timestamp, not alphabetically");
    assert.strictEqual(statusObj.computed_summary.latest_run_id, newerRunId, "Latest run should be the newest by timestamp, not alphabetically");
  } finally {
    if (fs.existsSync(olderResultPath)) fs.unlinkSync(olderResultPath);
    if (fs.existsSync(newerResultPath)) fs.unlinkSync(newerResultPath);
    if (fs.existsSync(alphaResultPath)) fs.unlinkSync(alphaResultPath);
    
    try { fs.unlinkSync(path.join(studyDir, "raw", "2026-06-13", `${olderSuiteId}__${olderRunId}.json`)); } catch(e) {}
    try { fs.unlinkSync(path.join(studyDir, "raw", "2026-06-13", `${newerSuiteId}__${newerRunId}.json`)); } catch(e) {}
    try { fs.unlinkSync(path.join(studyDir, "raw", "2026-06-13", `${alphabeticallyLateSuiteId}__${alphabeticallyLateRunId}.json`)); } catch(e) {}
    try { fs.unlinkSync(path.join(studyDir, "reviews", "2026-06-13", `${olderSuiteId}__${olderRunId}.md`)); } catch(e) {}
    try { fs.unlinkSync(path.join(studyDir, "reviews", "2026-06-13", `${newerSuiteId}__${newerRunId}.md`)); } catch(e) {}
    try { fs.unlinkSync(path.join(studyDir, "reviews", "2026-06-13", `${alphabeticallyLateSuiteId}__${alphabeticallyLateRunId}.md`)); } catch(e) {}
    
    execSync(`node "${tabulateScript}"`, { stdio: "ignore" });
  }
});
