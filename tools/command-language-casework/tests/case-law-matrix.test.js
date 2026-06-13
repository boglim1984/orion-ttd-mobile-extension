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
