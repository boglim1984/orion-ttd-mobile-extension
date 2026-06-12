const fs = require("node:fs");
const path = require("node:path");

const { buildReducerStateFromFixture } = require("./fixtureState.js");
const { applyReducerEvent } = require("./reducer.js");
const { RESERVED_CATEGORIES, SCORER_VERSION, scoreReducerEvent, summarizeScoredEvents } = require("./scorer.js");

function loadWorkflowFixtures(fixturesDir) {
  return fs
    .readdirSync(fixturesDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const absolutePath = path.join(fixturesDir, file);
      const fixture = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
      return {
        file,
        absolutePath,
        fixture
      };
    });
}

function runWorkflowFixture(fixtureRecord) {
  const { fixture, file } = fixtureRecord;
  let state = buildReducerStateFromFixture(fixture);
  const eventResults = [];
  const auditRecords = [];

  for (const event of fixture.trial_events || []) {
    const priorState = clone(state);
    const reducerOutput = applyReducerEvent(state, event);
    const score = scoreReducerEvent({
      fixture,
      event,
      priorState,
      reducerOutput
    });

    state = reducerOutput.state;

    const eventResult = {
      event_id: event.event_id,
      event_type: event.type,
      expected_reducer_effect: event.expected_reducer_effect || null,
      actual_reducer_effect: reducerOutput.reducer_effect,
      expected_active_chunk_id: event.expected_active_chunk_id || null,
      actual_active_chunk_id: reducerOutput.state?.active_chunk_id || null,
      expected_route_status: event.expected_route_status || null,
      actual_route_status: reducerOutput.state?.route_status || null,
      normalized_intent: reducerOutput.validation?.normalized_intent || null,
      reducer_result: reducerOutput.result,
      category: score.category,
      ok: score.ok,
      reasons: score.reasons,
      reserved_category: score.reserved_category
    };

    eventResults.push(eventResult);
    auditRecords.push(reducerOutput.audit_record);
  }

  const summary = summarizeScoredEvents(eventResults);
  const status = summary.fail_count === 0 ? "PASS" : "FAIL";

  return {
    fixture_file: file,
    route_id: fixture.route_id,
    goal: fixture.goal,
    failure_rows_covered: Array.isArray(fixture.failure_rows_covered) ? [...fixture.failure_rows_covered] : [],
    status,
    summary,
    final_state: state,
    event_results: eventResults,
    audit_records: auditRecords
  };
}

function runAllWorkflowFixtures(fixturesDir) {
  const fixtures = loadWorkflowFixtures(fixturesDir);
  const fixtureResults = fixtures.map(runWorkflowFixture);
  const allEventResults = fixtureResults.flatMap((result) => result.event_results);
  const allAuditRecords = fixtureResults.flatMap((result) => result.audit_records);
  const summary = summarizeScoredEvents(allEventResults);

  return {
    generated_at: new Date().toISOString(),
    fixture_count: fixtureResults.length,
    total_events: summary.total_events,
    pass_count: summary.pass_count,
    pass_with_repair_count: summary.pass_with_repair_count,
    fail_count: summary.fail_count,
    reserved_category_count: summary.reserved_category_count,
    reserved_categories: [...RESERVED_CATEGORIES],
    per_fixture_results: fixtureResults,
    per_event_results: allEventResults,
    audit_records: allAuditRecords,
    failure_rows_covered: Array.from(
      new Set(fixtureResults.flatMap((result) => result.failure_rows_covered))
    ).sort(),
    scorer_version: SCORER_VERSION
  };
}

function formatWorkflowRunSummary(report) {
  const lines = [
    "# Milestone 6C Workflow Fixture Run Summary",
    "",
    `Status: ${report.fail_count === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Totals",
    "",
    `- Fixtures run: ${report.fixture_count}`,
    `- Total events: ${report.total_events}`,
    `- PASS: ${report.pass_count}`,
    `- PASS_WITH_REPAIR: ${report.pass_with_repair_count}`,
    `- FAIL: ${report.fail_count}`,
    `- Reserved-category count: ${report.reserved_category_count}`,
    "",
    "## Invariants Verified",
    "",
    "- `done` completes but does not advance",
    "- `move_on` advances exactly one chunk",
    "- `next` normalizes to `move_on`",
    "- side questions do not mutate route progress",
    "- `return_to_route` restores active route/chunk posture",
    "- `recovery_signal` remains non-progress-mutating",
    "- final route completion requires `terminal_commit`",
    "",
    "## Reserved Categories",
    "",
    "- `FAIL_TOO_MANY_QUESTIONS`",
    "- `FAIL_UNSAFE_ACTION`",
    "- `FAIL_NO_RESPONSE_CONTRACT`",
    "- `FAIL_CADENCE_TOO_FAST`",
    "- `FAIL_CADENCE_TOO_SLOW`",
    "",
    "These remain reserved in Milestone 6C because the scorer is evaluating local reducer behavior, not assistant prose or DOM-side runtime conduct.",
    "",
    "## Fixture Status",
    ""
  ];

  for (const fixture of report.per_fixture_results) {
    lines.push(`- ${fixture.route_id}: ${fixture.status} (${fixture.summary.total_events} events)`);
  }

  if (report.fail_count > 0) {
    lines.push("", "## Failures", "");
    for (const eventResult of report.per_event_results.filter((result) => !result.ok)) {
      lines.push(`- ${eventResult.event_id} / ${eventResult.event_type}: ${eventResult.category} (${eventResult.reasons.join(", ")})`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  formatWorkflowRunSummary,
  loadWorkflowFixtures,
  runAllWorkflowFixtures,
  runWorkflowFixture
};
