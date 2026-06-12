const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { applyReducerEvent, buildReducerStateFromFixture } = require("../../src/reducer/index.js");

const fixturePath = path.resolve(__dirname, "..", "..", "test-fixtures", "workflows", "recover-turn-v0.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

test("recovery signal creates pending recovery without route mutation and repair packet reanchors", () => {
  let state = buildReducerStateFromFixture(fixture);
  const [rt01, rt02] = fixture.trial_events;

  let out = applyReducerEvent(state, rt01);
  state = out.state;
  assert.equal(out.validation.normalized_intent, "recovery_signal");
  assert.equal(state.pending_recovery, true);
  assert.equal(state.phase, "hold");
  assert.equal(state.active_chunk_id, "chunk_02_collect_dishes");
  assert.equal(out.result, "repair");

  out = applyReducerEvent(state, rt02);
  state = out.state;
  assert.equal(out.validation.normalized_intent, "repair");
  assert.equal(state.pending_recovery, false);
  assert.equal(state.phase, "active");
  assert.equal(state.submit_mode, "disabled");
  assert.equal(state.active_chunk_id, "chunk_02_collect_dishes");
});
