const test = require("node:test");
const assert = require("node:assert/strict");

const { scoreReducerEvent } = require("../../src/reducer/scorer.js");

test("scorer returns PASS for expected reducer behavior", () => {
  const event = {
    event_id: "e03",
    type: "done",
    expected_reducer_effect: "complete_chunk_no_advance",
    expected_active_chunk_id: "chunk_01_clear_trash"
  };
  const priorState = {
    route_id: "desk-reset-v0",
    route_status: "active",
    active_chunk_id: "chunk_01_clear_trash",
    chunk_completion: { chunk_01_clear_trash: false }
  };
  const reducerOutput = {
    ok: true,
    reducer_effect: "complete_chunk_no_advance",
    result: "commit",
    validation: { normalized_intent: "done" },
    state: {
      route_id: "desk-reset-v0",
      route_status: "active",
      active_chunk_id: "chunk_01_clear_trash",
      chunk_completion: { chunk_01_clear_trash: true }
    }
  };

  const score = scoreReducerEvent({ fixture: {}, event, priorState, reducerOutput });
  assert.equal(score.category, "PASS");
});

test("scorer catches illegal advance on done", () => {
  const event = {
    event_id: "e03",
    type: "done",
    expected_reducer_effect: "complete_chunk_no_advance",
    expected_active_chunk_id: "chunk_01_clear_trash"
  };
  const priorState = {
    route_id: "desk-reset-v0",
    route_status: "active",
    active_chunk_id: "chunk_01_clear_trash",
    chunk_completion: { chunk_01_clear_trash: false }
  };
  const reducerOutput = {
    ok: true,
    reducer_effect: "complete_chunk_no_advance",
    result: "commit",
    validation: { normalized_intent: "done" },
    state: {
      route_id: "desk-reset-v0",
      route_status: "active",
      active_chunk_id: "chunk_02_collect_dishes",
      chunk_completion: { chunk_01_clear_trash: true, chunk_02_collect_dishes: false }
    }
  };

  const score = scoreReducerEvent({ fixture: {}, event, priorState, reducerOutput });
  assert.equal(score.category, "FAIL_LOST_ROUTE");
});

test("scorer catches route completion before terminal_commit", () => {
  const event = {
    event_id: "e15",
    type: "done",
    expected_reducer_effect: "complete_chunk_no_route_complete_until_legal_terminal_commit",
    expected_active_chunk_id: "chunk_05_choose_next_work_item",
    expected_route_status: "active"
  };
  const priorState = {
    route_id: "desk-reset-v0",
    route_status: "active",
    active_chunk_id: "chunk_05_choose_next_work_item",
    chunk_completion: { chunk_05_choose_next_work_item: false }
  };
  const reducerOutput = {
    ok: true,
    reducer_effect: "complete_chunk_no_route_complete_until_legal_terminal_commit",
    result: "commit",
    validation: { normalized_intent: "done" },
    state: {
      route_id: "desk-reset-v0",
      route_status: "complete",
      active_chunk_id: "chunk_05_choose_next_work_item",
      chunk_completion: { chunk_05_choose_next_work_item: true }
    }
  };

  const score = scoreReducerEvent({ fixture: {}, event, priorState, reducerOutput });
  assert.equal(score.category, "FAIL_INVENTED_STATE");
});
