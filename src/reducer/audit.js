function createAuditRecord({
  priorState,
  nextState,
  event,
  normalizedIntent,
  eventClass,
  guardsEvaluated,
  guardResults,
  reducerEffect,
  result,
  refusalReason = null,
  notes = ""
}) {
  return {
    event_id: event?.event_id ?? null,
    prior_state_version: priorState?.state_version ?? null,
    next_state_version: nextState?.state_version ?? null,
    route_id: nextState?.route_id ?? priorState?.route_id ?? null,
    active_chunk_id_before: priorState?.active_chunk_id ?? null,
    active_chunk_id_after: nextState?.active_chunk_id ?? null,
    event_type: event?.type ?? null,
    normalized_intent: normalizedIntent ?? null,
    event_class: eventClass ?? null,
    guards_evaluated: Array.isArray(guardsEvaluated) ? [...guardsEvaluated] : [],
    guard_results: guardResults && typeof guardResults === "object" ? { ...guardResults } : {},
    reducer_effect: reducerEffect ?? null,
    result: result ?? null,
    refusal_reason: refusalReason,
    notes
  };
}

module.exports = {
  createAuditRecord
};
