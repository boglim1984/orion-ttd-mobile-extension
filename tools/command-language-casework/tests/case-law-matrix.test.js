const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../../..");
const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
const studyDir = path.join(caseworkRoot, "study");
const rawDir = path.join(studyDir, "raw");
const matrixScript = path.join(caseworkRoot, "scripts", "update-casework-case-law-matrix.mjs");
const csvPath = path.join(studyDir, "case-law", "CASEWORK_CASE_LAW_MATRIX_V1.csv");
const jsonlPath = path.join(studyDir, "case-law", "CASEWORK_CASE_LAW_MATRIX_V1.jsonl");

function loadJsonlRows() {
  return fs
    .readFileSync(jsonlPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

test("case-law matrix script writes headers, jsonl rows, and tolerates sparse results", () => {
  const tempDateDir = path.join(rawDir, "2026-06-14");
  const tempResultPath = path.join(tempDateDir, "matrix_sparse_suite__20260614-010101-matrix_sparse_suite.json");
  fs.mkdirSync(tempDateDir, { recursive: true });
  fs.writeFileSync(
    tempResultPath,
    JSON.stringify({
      suite_id: "matrix_sparse_suite",
      run_id: "20260614-010101-matrix_sparse_suite",
      cases: [
        {
          case_id: "sparse_case_001",
          title: "Sparse case",
          packet_sent: "TTD_COMMAND_V1\n{\"route_id\":\"desk-reset-v0\",\"active_chunk_id\":\"clear_trash\",\"active_chunk_label\":\"clear trash\"}",
          visible_turn_text: "Holding current chunk.",
          expected_behavior: [],
          forbidden_behavior: []
        }
      ]
    }),
    "utf8"
  );

  try {
    execSync(`node "${matrixScript}"`, { stdio: "ignore" });

    assert.ok(fs.existsSync(csvPath), "CSV matrix should exist");
    assert.ok(fs.existsSync(jsonlPath), "JSONL matrix should exist");

    const csvText = fs.readFileSync(csvPath, "utf8");
    assert.match(csvText, /^suite_id,case_id,run_id,run_date,/);
    assert.match(csvText, /legal_verdict/);
    assert.match(csvText, /source_review_path/);
    assert.match(csvText, /matrix_sparse_suite/);

    const jsonlText = fs.readFileSync(jsonlPath, "utf8");
    const sparseRow = jsonlText
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))
      .find((row) => row.case_id === "sparse_case_001");

    assert.ok(sparseRow, "Sparse row should be present in JSONL output");
    assert.strictEqual(sparseRow.packet_style, "TTD_COMMAND_V1");
    assert.strictEqual(sparseRow.source_result_path.includes("matrix_sparse_suite"), true);
    assert.strictEqual(typeof sparseRow.legal_verdict, "string");
  } finally {
    fs.unlinkSync(tempResultPath);
    try {
      fs.rmdirSync(tempDateDir);
    } catch (_error) {}
    execSync(`node "${matrixScript}"`, { stdio: "ignore" });
  }
});

test("case-law matrix keeps collect_dishes repair survived and wrong-next negative control unsatisfied", () => {
  execSync(`node "${matrixScript}"`, { stdio: "ignore" });
  const rows = loadJsonlRows();

  const repairedRows = rows.filter((row) => row.case_id === "scorer_keyword_v2_006_early_visible_position");
  assert.ok(repairedRows.length > 0, "Expected repaired collect_dishes rows to exist");
  for (const row of repairedRows) {
    assert.strictEqual(row.classification, "PASS_CANDIDATE");
    assert.strictEqual(row.route_survival_outcome, "survived");
  }

  const wrongNextRows = rows.filter((row) => row.case_id === "scorer_keyword_v2_008_negative_wrong_next_chunk");
  assert.ok(wrongNextRows.length > 0, "Expected wrong-next negative rows to exist");
  for (const row of wrongNextRows) {
    assert.strictEqual(row.classification, "FAIL_LOST_ROUTE");
    assert.notStrictEqual(row.route_survival_outcome, "survived");
  }
});
