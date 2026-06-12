const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { applyReducerEvent, buildReducerStateFromFixture } = require("../../src/reducer/index.js");

const fixturePath = path.resolve(__dirname, "..", "..", "test-fixtures", "workflows", "side-question-return-v0.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

test("side-question fixture keeps route anchored across interruption and return", () => {
  let state = buildReducerStateFromFixture(fixture);
  const [sq01, sq02] = fixture.trial_events;

  let out = applyReducerEvent(state, sq01);
  state = out.state;
  assert.equal(out.validation.event_class, "recovery_system_event");
  assert.equal(state.active_chunk_id, "chunk_03_stack_papers");
  assert.equal(state.route_status, "active");
  assert.equal(state.phase, "hold");

  out = applyReducerEvent(state, sq02);
  state = out.state;
  assert.equal(out.validation.normalized_intent, "return_to_route");
  assert.equal(state.active_chunk_id, "chunk_03_stack_papers");
  assert.equal(state.phase, "active");
});
