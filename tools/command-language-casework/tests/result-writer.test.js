const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  writeCaseworkRunResults
} = require("../lib/casework-results.js");

test("result writer creates the expected artifact set", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "casework-results-"));
  const suite = {
    suite_id: "demo-suite"
  };
  const runResult = {
    suite_id: "demo-suite",
    run_id: "demo-run",
    started_at: "2026-06-12T15:00:00.000Z",
    completed_at: "2026-06-12T15:01:00.000Z",
    browser_context_note: "test",
    tool_version: "command-language-casework-runner-v1",
    heuristics_version: "heuristics-route-alias-boundary-v3",
    warnings: [],
    errors: [],
    cases: [
      {
        case_id: "case-001",
        heuristic_classification: "PASS_CANDIDATE",
        packet_sent: "TTD_COMMAND_V1",
        scripted_user_replies_sent: [
          "continue"
        ],
        assistant_responses: [
          "Still on clear trash."
        ],
        visible_turn_text: "Still on clear trash.",
        observed_chunks_or_keywords: [
          "clear trash"
        ],
        expected_behavior: [
          "assistant preserves active_chunk_id: clear_trash"
        ],
        forbidden_behavior: [
          "collect_dishes"
        ],
        notes: "",
        raw_turn_log: [
          {
            at: "2026-06-12T15:00:10.000Z",
            actor: "packet",
            text: "TTD_COMMAND_V1"
          }
        ]
      }
    ]
  };

  const output = writeCaseworkRunResults({
    resultsRoot: tempRoot,
    suite,
    runResult
  });

  assert.equal(fs.existsSync(output.inputSuitePath), true);
  assert.equal(fs.existsSync(output.runResultPath), true);
  assert.equal(fs.existsSync(output.runJsonlPath), true);
  assert.equal(fs.existsSync(output.runSummaryPath), true);
  assert.equal(fs.existsSync(output.rawTranscriptPath), true);
  assert.equal(fs.existsSync(path.join(output.caseLogsDir, "case-001.md")), true);
  assert.match(fs.readFileSync(output.runSummaryPath, "utf8"), /heuristics_version: heuristics-route-alias-boundary-v3/);
});
