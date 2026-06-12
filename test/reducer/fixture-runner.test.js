const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  loadWorkflowFixtures,
  runAllWorkflowFixtures
} = require("../../src/reducer/fixtureRunner.js");

const fixturesDir = path.resolve(__dirname, "..", "..", "test-fixtures", "workflows");

test("fixture runner loads all three workflow fixtures", () => {
  const fixtures = loadWorkflowFixtures(fixturesDir);
  assert.equal(fixtures.length, 3);
});

test("fixture runner produces per-fixture and per-event results with audit records", () => {
  const report = runAllWorkflowFixtures(fixturesDir);

  assert.equal(report.fixture_count, 3);
  assert.ok(report.total_events > 0);
  assert.equal(report.fail_count, 0);
  assert.equal(report.per_fixture_results.length, 3);
  assert.ok(report.per_event_results.length >= report.total_events);
  assert.equal(report.audit_records.length, report.total_events);
  assert.ok(report.failure_rows_covered.includes("F076"));
});
