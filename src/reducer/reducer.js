const { createAuditRecord } = require("./audit.js");
const { validateReducerEvent } = require("./validator.js");

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function applyReducerEvent(currentState, event) {
  const priorState = clone(currentState);
  const validation = validateReducerEvent(event, priorState);

  if (!validation.ok) {
    const nextState = clone(priorState);
    return {
      ok: false,
      validation,
      state: nextState,
      reducer_effect: validation.effect,
      result: validation.effect === "hold" ? "hold" : "reject",
      audit_record: createAuditRecord({
        priorState,
        nextState,
        event,
        normalizedIntent: null,
        eventClass: null,
        guardsEvaluated: validation.guards_evaluated,
        guardResults: validation.guard_results,
        reducerEffect: validation.effect,
        result: validation.effect === "hold" ? "hold" : "reject",
        refusalReason: validation.reason,
        notes: "Validation boundary refused the event before reducer mutation."
      })
    };
  }

  const reduced = reduceValidatedEvent(priorState, event, validation);
  return {
    ok: true,
    validation,
    state: reduced.state,
    reducer_effect: reduced.reducer_effect,
    result: reduced.result,
    audit_record: reduced.audit_record
  };
}

function reduceValidatedEvent(priorState, event, validation) {
  const nextState = clone(priorState);
  const guardsEvaluated = [
    ...validation.guards_evaluated,
    "single_active_chunk_guard",
    "done_vs_move_on_guard",
    "pending_recovery_guard",
    "terminal_commit_guard",
    "no_invented_progress_guard"
  ];
  const guardResults = {
    ...validation.guard_results,
    single_active_chunk_guard: Boolean(nextState.active_chunk_id),
    done_vs_move_on_guard: true,
    pending_recovery_guard: true,
    terminal_commit_guard: true,
    no_invented_progress_guard: true
  };

  let reducerEffect = "hold";
  let result = "hold";
  let refusalReason = null;
  let notes = "";
  let shouldIncrementVersion = true;

  switch (validation.normalized_intent) {
    case "start":
      nextState.route_status = "active";
      nextState.phase = "active";
      nextState.hold_reason = null;
      reducerEffect = "hold_active_chunk";
      result = "hold";
      break;

    case "continue":
      nextState.route_status = "active";
      nextState.phase = "active";
      nextState.hold_reason = null;
      reducerEffect = "keep_active_chunk";
      result = "commit";
      break;

    case "stuck":
      nextState.phase = "hold";
      nextState.route_status = "active";
      nextState.hold_reason = "stuck";
      reducerEffect = "hold_and_help";
      result = "hold";
      break;

    case "done":
      nextState.chunk_completion[nextState.active_chunk_id] = true;
      nextState.phase = "active";
      nextState.route_status = nextState.route_status === "complete" ? "complete" : "active";
      reducerEffect = isFinalChunk(nextState)
        ? "complete_chunk_no_route_complete_until_legal_terminal_commit"
        : "complete_chunk_no_advance";
      result = "commit";
      break;

    case "move_on":
      if (!nextState.chunk_completion[nextState.active_chunk_id]) {
        guardResults.no_invented_progress_guard = false;
        reducerEffect = "reject";
        result = "reject";
        refusalReason = "chunk_not_complete_for_move_on";
        shouldIncrementVersion = false;
        break;
      }

      if (isFinalChunk(nextState)) {
        guardResults.done_vs_move_on_guard = false;
        reducerEffect = "reject";
        result = "reject";
        refusalReason = "no_next_chunk";
        shouldIncrementVersion = false;
        break;
      }

      advanceToNextChunk(nextState);
      nextState.route_status = "active";
      nextState.phase = "active";
      nextState.hold_reason = null;
      reducerEffect = "advance_exactly_one_chunk";
      result = "commit";
      break;

    case "side_question":
      nextState.phase = "hold";
      nextState.parked_side_questions = Array.isArray(nextState.parked_side_questions)
        ? nextState.parked_side_questions
        : [];
      nextState.parked_side_questions.push({
        event_id: event.event_id,
        utterance: event.utterance || null
      });
      nextState.hold_reason = "side_question";
      reducerEffect = "answer_then_restore_route";
      result = "hold";
      break;

    case "return_to_route":
      nextState.phase = "active";
      nextState.hold_reason = null;
      reducerEffect = "keep_active_chunk";
      result = "commit";
      break;

    case "recovery_signal":
      nextState.phase = "hold";
      nextState.pending_recovery = true;
      nextState.hold_reason = "pending_recovery_signal";
      nextState.recent_signals = Array.isArray(nextState.recent_signals) ? nextState.recent_signals : [];
      nextState.recent_signals.push(event.signal || event.utterance || event.type);
      reducerEffect = "construct_repair_packet_without_commit";
      result = "repair";
      break;

    case "repair":
      nextState.pending_recovery = false;
      nextState.phase = "active";
      nextState.route_status = "active";
      nextState.hold_reason = null;
      nextState.submit_mode = "disabled";
      nextState.repair_count += 1;
      reducerEffect = "reanchor_route_keep_submit_disabled";
      result = "repair";
      break;

    case "terminal_commit":
      if (!isTerminalCommitReady(nextState)) {
        guardResults.terminal_commit_guard = false;
        reducerEffect = "reject";
        result = "reject";
        refusalReason = "terminal_conditions_not_met";
        shouldIncrementVersion = false;
        break;
      }

      nextState.route_status = "complete";
      nextState.phase = "complete";
      nextState.hold_reason = null;
      reducerEffect = "complete_route";
      result = "complete";
      break;

    case "pause":
      nextState.phase = "paused";
      nextState.route_status = "paused";
      nextState.paused_reason = event.utterance || "pause";
      reducerEffect = "pause_route";
      result = "hold";
      break;

    case "re_chunk":
      nextState.phase = "hold";
      nextState.hold_reason = "re_chunk_requested";
      reducerEffect = "hold_for_rechunk";
      result = "hold";
      break;

    default:
      reducerEffect = "reject";
      result = "reject";
      refusalReason = "unsupported_intent";
      shouldIncrementVersion = false;
      break;
  }

  if (shouldIncrementVersion) {
    nextState.state_version = (priorState.state_version || 0) + 1;
    nextState.last_event_id = event.event_id;
    nextState.last_committed_action = validation.normalized_intent;
    nextState.processed_event_ids = Array.isArray(nextState.processed_event_ids)
      ? nextState.processed_event_ids
      : [];
    nextState.processed_event_ids.push(event.event_id);
    if (nextState.processed_event_ids.length > 50) {
      nextState.processed_event_ids = nextState.processed_event_ids.slice(-50);
    }
  } else {
    notes = "Reducer refused the event after validation.";
  }

  const auditRecord = createAuditRecord({
    priorState,
    nextState,
    event,
    normalizedIntent: validation.normalized_intent,
    eventClass: validation.event_class,
    guardsEvaluated,
    guardResults,
    reducerEffect,
    result,
    refusalReason,
    notes
  });

  return {
    state: nextState,
    reducer_effect: reducerEffect,
    result,
    audit_record: auditRecord
  };
}

function advanceToNextChunk(state) {
  const nextIndex = state.chunk_index + 1;
  const nextChunk = state.chunks[nextIndex];
  state.chunk_index = nextIndex;
  state.active_chunk_id = nextChunk.chunk_id;
  state.active_chunk_label = nextChunk.label;
  state.completion_condition = nextChunk.completion_condition || null;
}

function isFinalChunk(state) {
  return Array.isArray(state.chunks) && state.chunk_index === state.chunks.length - 1;
}

function isTerminalCommitReady(state) {
  return Boolean(
    isFinalChunk(state) &&
      state.chunk_completion &&
      state.chunk_completion[state.active_chunk_id] === true
  );
}

module.exports = {
  applyReducerEvent,
  reduceValidatedEvent
};
