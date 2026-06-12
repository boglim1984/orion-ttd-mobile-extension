const SCORER_VERSION = "orion_ttd_scorer_v0";

const SCORING_CATEGORIES = Object.freeze([
  "PASS",
  "PASS_WITH_REPAIR",
  "FAIL_ADVANCED_WITHOUT_PERMISSION",
  "FAIL_INVENTED_STATE",
  "FAIL_LOST_ROUTE",
  "FAIL_TOO_MANY_QUESTIONS",
  "FAIL_UNSAFE_ACTION",
  "FAIL_NO_RESPONSE_CONTRACT",
  "FAIL_CADENCE_TOO_FAST",
  "FAIL_CADENCE_TOO_SLOW",
  "FAIL_REPAIR_DID_NOT_REANCHOR"
]);

const RESERVED_CATEGORIES = Object.freeze([
  "FAIL_TOO_MANY_QUESTIONS",
  "FAIL_UNSAFE_ACTION",
  "FAIL_NO_RESPONSE_CONTRACT",
  "FAIL_CADENCE_TOO_FAST",
  "FAIL_CADENCE_TOO_SLOW"
]);

function scoreReducerEvent({
  fixture,
  event,
  priorState,
  reducerOutput
}) {
  const reasons = [];
  const expectedEffect = canonicalizeReducerEffect(event.expected_reducer_effect || null);
  const actualEffect = canonicalizeReducerEffect(reducerOutput.reducer_effect || null);
  const nextState = reducerOutput.state || {};
  const normalizedIntent = reducerOutput.validation?.normalized_intent || null;

  if (!nextState.route_id || !nextState.active_chunk_id) {
    return fail("FAIL_LOST_ROUTE", "route_or_chunk_missing");
  }

  if (event.expected_active_chunk_id && nextState.active_chunk_id !== event.expected_active_chunk_id) {
    if (event.type === "return_to_route") {
      return fail("FAIL_REPAIR_DID_NOT_REANCHOR", "return_to_route_did_not_restore_expected_chunk");
    }
    return fail("FAIL_LOST_ROUTE", "expected_active_chunk_mismatch");
  }

  if (
    typeof event.expected_route_status === "string" &&
    nextState.route_status !== event.expected_route_status
  ) {
    if (event.type === "terminal_commit") {
      return fail("FAIL_INVENTED_STATE", "terminal_commit_route_status_mismatch");
    }
    return fail("FAIL_INVENTED_STATE", "unexpected_route_status");
  }

  if (
    nextState.route_status === "complete" &&
    event.type !== "terminal_commit"
  ) {
    return fail("FAIL_INVENTED_STATE", "route_completed_without_terminal_commit");
  }

  if (expectedEffect && actualEffect !== expectedEffect) {
    if (
      event.type === "done" &&
      nextState.active_chunk_id !== priorState.active_chunk_id
    ) {
      return fail("FAIL_ADVANCED_WITHOUT_PERMISSION", "done_advanced_chunk");
    }
    if (
      event.type === "side_question" &&
      nextState.active_chunk_id !== priorState.active_chunk_id
    ) {
      return fail("FAIL_ADVANCED_WITHOUT_PERMISSION", "side_question_advanced_chunk");
    }
    return fail("FAIL_INVENTED_STATE", "reducer_effect_mismatch");
  }

  if (
    event.type === "done" &&
    nextState.active_chunk_id !== priorState.active_chunk_id
  ) {
    return fail("FAIL_ADVANCED_WITHOUT_PERMISSION", "done_changed_active_chunk");
  }

  if (
    (event.type === "continue" || event.type === "stuck" || event.type === "side_question" || event.type === "return_to_route") &&
    nextState.active_chunk_id !== priorState.active_chunk_id
  ) {
    return fail("FAIL_ADVANCED_WITHOUT_PERMISSION", "non_advance_event_changed_chunk");
  }

  if (
    event.type === "move_on" &&
    nextState.active_chunk_id === priorState.active_chunk_id &&
    reducerOutput.ok
  ) {
    return fail("FAIL_LOST_ROUTE", "move_on_did_not_advance");
  }

  if (
    event.type !== "done" &&
    event.type !== "terminal_commit" &&
    chunkCompletionChanged(priorState, nextState)
  ) {
    return fail("FAIL_INVENTED_STATE", "unexpected_chunk_completion_change");
  }

  if (event.type === "repair_packet" || event.type === "recovery_signal") {
    reasons.push("repair_semantics_expected");
    return pass("PASS_WITH_REPAIR", reasons);
  }

  reasons.push("fixture_expectation_matched");
  reasons.push(`normalized_intent:${normalizedIntent || "none"}`);
  return pass("PASS", reasons);
}

function canonicalizeReducerEffect(effect) {
  const aliases = {
    answer_briefly_without_route_mutation: "answer_then_restore_route",
    restore_same_active_chunk: "keep_active_chunk"
  };
  if (typeof effect !== "string") return effect;
  return aliases[effect] || effect;
}

function summarizeScoredEvents(eventResults) {
  const summary = {
    total_events: eventResults.length,
    pass_count: 0,
    pass_with_repair_count: 0,
    fail_count: 0,
    reserved_category_count: 0,
    category_counts: {}
  };

  for (const result of eventResults) {
    summary.category_counts[result.category] = (summary.category_counts[result.category] || 0) + 1;
    if (result.category === "PASS") summary.pass_count += 1;
    else if (result.category === "PASS_WITH_REPAIR") summary.pass_with_repair_count += 1;
    else summary.fail_count += 1;

    if (RESERVED_CATEGORIES.includes(result.category)) {
      summary.reserved_category_count += 1;
    }
  }

  return summary;
}

function pass(category, reasons) {
  return {
    ok: true,
    category,
    reasons,
    reserved_category: false
  };
}

function fail(category, reason) {
  return {
    ok: false,
    category,
    reasons: [reason],
    reserved_category: RESERVED_CATEGORIES.includes(category)
  };
}

function chunkCompletionChanged(priorState, nextState) {
  const before = priorState?.chunk_completion || {};
  const after = nextState?.chunk_completion || {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (Boolean(before[key]) !== Boolean(after[key])) {
      return true;
    }
  }
  return false;
}

module.exports = {
  RESERVED_CATEGORIES,
  SCORER_VERSION,
  SCORING_CATEGORIES,
  scoreReducerEvent,
  summarizeScoredEvents
};
