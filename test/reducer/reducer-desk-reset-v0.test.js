const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { applyReducerEvent, buildReducerStateFromFixture } = require("../../src/reducer/index.js");

const fixturePath = path.resolve(__dirname, "..", "..", "test-fixtures", "workflows", "desk-reset-v0.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

test("desk-reset fixture parses and uses active_chunk_id as canonical field", () => {
  assert.equal(fixture.state_template.active_chunk_id, "chunk_01_clear_trash");
  assert.equal("active_chunk" in fixture.state_template, false);
});

test("desk-reset reducer preserves done vs move_on semantics through terminal commit", () => {
  let state = buildReducerStateFromFixture(fixture);

  const byId = Object.fromEntries(fixture.trial_events.map((event) => [event.event_id, event]));

  let out = applyReducerEvent(state, byId.e01);
  state = out.state;
  assert.equal(state.active_chunk_id, "chunk_01_clear_trash");

  out = applyReducerEvent(state, byId.e03);
  state = out.state;
  assert.equal(state.chunk_completion.chunk_01_clear_trash, true);
  assert.equal(state.active_chunk_id, "chunk_01_clear_trash");

  out = applyReducerEvent(state, byId.e04);
  state = out.state;
  assert.equal(out.validation.normalized_intent, "move_on");
  assert.equal(state.active_chunk_id, "chunk_02_collect_dishes");

  out = applyReducerEvent(state, byId.e07);
  state = out.state;
  assert.equal(state.chunk_completion.chunk_02_collect_dishes, true);
  assert.equal(state.active_chunk_id, "chunk_02_collect_dishes");

  out = applyReducerEvent(state, byId.e08);
  state = out.state;
  assert.equal(out.validation.normalized_intent, "move_on");
  assert.equal(state.active_chunk_id, "chunk_03_stack_papers");

  out = applyReducerEvent(state, byId.e09);
  state = out.state;
  assert.equal(state.active_chunk_id, "chunk_03_stack_papers");
  assert.equal(state.chunk_index, 2);
  assert.equal(state.parked_side_questions.length, 1);

  out = applyReducerEvent(state, byId.e10);
  state = out.state;
  assert.equal(state.active_chunk_id, "chunk_03_stack_papers");
  assert.equal(state.phase, "active");

  out = applyReducerEvent(state, byId.e11);
  state = out.state;
  assert.equal(state.chunk_completion.chunk_03_stack_papers, true);

  out = applyReducerEvent(state, byId.e12);
  state = out.state;
  assert.equal(state.active_chunk_id, "chunk_04_wipe_surface");

  out = applyReducerEvent(state, byId.e13);
  state = out.state;
  assert.equal(state.chunk_completion.chunk_04_wipe_surface, true);

  out = applyReducerEvent(state, byId.e14);
  state = out.state;
  assert.equal(state.active_chunk_id, "chunk_05_choose_next_work_item");

  out = applyReducerEvent(state, byId.e15);
  state = out.state;
  assert.equal(state.chunk_completion.chunk_05_choose_next_work_item, true);
  assert.equal(state.route_status, "active");

  out = applyReducerEvent(state, byId.e16);
  state = out.state;
  assert.equal(state.route_status, "complete");
  assert.equal(state.phase, "complete");
  assert.equal(out.audit_record.result, "complete");
});
