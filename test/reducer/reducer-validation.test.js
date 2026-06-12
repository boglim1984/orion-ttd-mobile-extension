const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  applyReducerEvent,
  buildReducerStateFromFixture,
  validateReducerEvent
} = require("../../src/reducer/index.js");

const fixturesDir = path.resolve(__dirname, "..", "..", "test-fixtures", "workflows");
const deskResetFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, "desk-reset-v0.json"), "utf8"));

test("all workflow fixtures parse as JSON", () => {
  for (const file of fs.readdirSync(fixturesDir)) {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(fixturesDir, file), "utf8")));
  }
});

test("validator rejects duplicate events without mutation", () => {
  const state = buildReducerStateFromFixture(deskResetFixture);
  const first = applyReducerEvent(state, deskResetFixture.trial_events[0]);
  const duplicate = applyReducerEvent(first.state, deskResetFixture.trial_events[0]);

  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.validation.reason, "duplicate_event");
  assert.equal(duplicate.state.state_version, first.state.state_version);
  assert.equal(duplicate.state.last_event_id, first.state.last_event_id);
});

test("validator rejects unsupported intents without mutation", () => {
  const state = buildReducerStateFromFixture(deskResetFixture);
  const unsupported = applyReducerEvent(state, {
    event_id: "bad01",
    type: "invented_intent",
    actor: "user",
    utterance: "skipish"
  });

  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.validation.reason, "unsupported_intent");
  assert.equal(unsupported.state.state_version, state.state_version);
});

test("validator rejects route or session mismatch", () => {
  const state = buildReducerStateFromFixture(deskResetFixture);

  const routeMismatch = validateReducerEvent(
    { event_id: "bad02", type: "continue", actor: "user", utterance: "continue", route_id: "wrong-route" },
    state
  );
  assert.equal(routeMismatch.ok, false);
  assert.equal(routeMismatch.reason, "route_mismatch");

  const sessionMismatch = validateReducerEvent(
    { event_id: "bad03", type: "continue", actor: "user", utterance: "continue", session_id: "wrong-session" },
    state
  );
  assert.equal(sessionMismatch.ok, false);
  assert.equal(sessionMismatch.reason, "session_mismatch");
});

test("audit records include required reducer fields", () => {
  const state = buildReducerStateFromFixture(deskResetFixture);
  const out = applyReducerEvent(state, deskResetFixture.trial_events[0]);

  for (const field of [
    "event_id",
    "prior_state_version",
    "next_state_version",
    "route_id",
    "active_chunk_id_before",
    "active_chunk_id_after",
    "event_type",
    "normalized_intent",
    "event_class",
    "guards_evaluated",
    "guard_results",
    "reducer_effect",
    "result",
    "refusal_reason",
    "notes"
  ]) {
    assert.ok(Object.prototype.hasOwnProperty.call(out.audit_record, field), `missing ${field}`);
  }
});
