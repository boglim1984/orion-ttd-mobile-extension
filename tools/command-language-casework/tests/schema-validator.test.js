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
