const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  validateSuiteText
} = require("../lib/casework-validator.js");

const examplesDir = path.resolve(__dirname, "..", "examples");

test("schema validator accepts the shipped example suites", () => {
  const exampleFiles = [
    "desk-reset-baseline-suite.json",
    "side-question-return-suite.json",
    "ambiguity-fail-gracefully-suite.json"
  ];

  for (const fileName of exampleFiles) {
    const suiteText = fs.readFileSync(path.join(examplesDir, fileName), "utf8");
    const result = validateSuiteText(suiteText);
    assert.equal(result.ok, true, fileName);
  }
});

test("schema validator rejects a case with missing required fields", () => {
  const suite = {
    suite_id: "broken-suite",
    suite_title: "Broken Suite",
    suite_goal: "Test failure reporting",
    created_for_tool: "command-language-casework-runner-v1",
    route_id: "desk-reset-v0",
    run_config: {
      target_chat: "visible_current_chatgpt_page",
      send_mode: "explicit_casework_run_button",
      turn_timeout_ms: 1000,
      stability_wait_ms: 250,
      stop_on_case_failure: false,
      stop_after_each_case: false
    },
    cases: [
      {
        case_id: "bad"
      }
    ]
  };

  const result = validateSuiteText(JSON.stringify(suite));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /missing required field: title/);
  assert.match(result.errors.join("\n"), /missing required field: packet/);
});

test("schema validator rejects packet objects and accepts equivalent packet strings", () => {
  const invalidFixturePath = path.resolve(
    __dirname,
    "..",
    "test-fixtures",
    "invalid",
    "packet-object-suite.json"
  );
  const invalidResult = validateSuiteText(fs.readFileSync(invalidFixturePath, "utf8"));
  assert.equal(invalidResult.ok, false);
  assert.match(
    invalidResult.errors.join("\n"),
    /packet must be a non-empty string containing the TTD_COMMAND_V1 packet text, not a nested object/
  );

  const validSuite = {
    suite_id: "valid-packet-string-suite-v1",
    suite_title: "Valid Packet String Suite",
    suite_goal: "Confirm validator-ready packet strings are accepted.",
    created_for_tool: "command-language-casework-runner-v1",
    route_id: "desk-reset-v0",
    run_config: {
      send_mode: "explicit_casework_run_button",
      turn_timeout_ms: 1000,
      stability_wait_ms: 250
    },
    cases: [
      {
        case_id: "valid_packet_string_001",
        title: "Packet string should pass",
        research_question: "Does the validator accept string packets?",
        packet: "TTD_COMMAND_V1\n{\"protocol\":\"TTD_COMMAND_V1\",\"route_id\":\"desk-reset-v0\",\"active_chunk_id\":\"clear_trash\"}",
        scripted_user_replies: ["move_on"],
        expected_behavior: ["Assistant advances exactly one chunk."],
        forbidden_behavior: ["Assistant skips chunks."],
        expected_reducer_semantics: "move_on advances exactly one chunk.",
        classification_targets: ["PASS"]
      }
    ]
  };

  const validResult = validateSuiteText(JSON.stringify(validSuite));
  assert.equal(validResult.ok, true);
});

test("schema validator rejects array-shaped expected_reducer_semantics", () => {
  const suite = {
    suite_id: "bad-reducer-semantics-suite-v1",
    suite_title: "Bad Reducer Semantics Suite",
    suite_goal: "Confirm expected_reducer_semantics stays a string.",
    created_for_tool: "command-language-casework-runner-v1",
    route_id: "desk-reset-v0",
    run_config: {
      send_mode: "explicit_casework_run_button",
      turn_timeout_ms: 1000,
      stability_wait_ms: 250
    },
    cases: [
      {
        case_id: "bad_reducer_semantics_001",
        title: "Reducer semantics array should fail",
        research_question: "Does the validator reject array reducer semantics?",
        packet: "TTD_COMMAND_V1\n{\"protocol\":\"TTD_COMMAND_V1\"}",
        scripted_user_replies: [],
        expected_behavior: ["Hold route state."],
        forbidden_behavior: ["Invent progress."],
        expected_reducer_semantics: ["move_on", "advance_one_chunk"],
        classification_targets: ["PASS"]
      }
    ]
  };

  const result = validateSuiteText(JSON.stringify(suite));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /expected_reducer_semantics must be a non-empty string/);
});
