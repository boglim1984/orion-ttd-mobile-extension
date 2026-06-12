function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function buildChunkLookup(chunks) {
  return Object.fromEntries((Array.isArray(chunks) ? chunks : []).map((chunk) => [chunk.chunk_id, chunk]));
}

function buildReducerStateFromFixture(fixture) {
  const safeFixture = clone(fixture || {});
  const chunks = Array.isArray(safeFixture.chunks) ? safeFixture.chunks : [];
  const chunkLookup = buildChunkLookup(chunks);
  const template = safeFixture.state_template && typeof safeFixture.state_template === "object"
    ? safeFixture.state_template
    : {};

  const activeChunkId = typeof template.active_chunk_id === "string" ? template.active_chunk_id : null;
  const activeChunk = activeChunkId ? chunkLookup[activeChunkId] || null : null;
  const derivedChunkIndex = activeChunkId ? chunks.findIndex((chunk) => chunk.chunk_id === activeChunkId) : -1;
  const initialChunkIndex = Number.isInteger(template.chunk_index)
    ? template.chunk_index
    : Math.max(derivedChunkIndex, 0);

  const chunkCompletion = {};
  for (const chunk of chunks) {
    chunkCompletion[chunk.chunk_id] = false;
  }
  if (template.chunk_completion && typeof template.chunk_completion === "object") {
    for (const [chunkId, value] of Object.entries(template.chunk_completion)) {
      chunkCompletion[chunkId] = Boolean(value);
    }
  }

  return {
    route_id: typeof template.route_id === "string" ? template.route_id : safeFixture.route_id || null,
    session_id: typeof template.session_id === "string" ? template.session_id : null,
    state_version: Number.isInteger(template.state_version) ? template.state_version : 0,
    active_goal: typeof template.active_goal === "string" ? template.active_goal : safeFixture.goal || null,
    route_status: typeof template.route_status === "string" ? template.route_status : "active",
    active_chunk_id: activeChunkId,
    active_chunk_label:
      typeof template.active_chunk_label === "string"
        ? template.active_chunk_label
        : activeChunk?.label || activeChunkId,
    chunk_index: initialChunkIndex,
    chunks,
    allowed_intents: Array.isArray(template.allowed_intents)
      ? [...template.allowed_intents]
      : Array.isArray(safeFixture.allowed_intents)
        ? [...safeFixture.allowed_intents]
        : [],
    reducer_event_types: Array.isArray(template.reducer_event_types)
      ? [...template.reducer_event_types]
      : Array.isArray(safeFixture.reducer_event_types)
        ? [...safeFixture.reducer_event_types]
        : [],
    phase: typeof template.phase === "string" ? template.phase : "active",
    last_committed_action: typeof template.last_committed_action === "string" ? template.last_committed_action : "start",
    last_event_id: typeof template.last_event_id === "string" ? template.last_event_id : null,
    cadence_mode: typeof template.cadence_mode === "string" ? template.cadence_mode : null,
    confidence_bias: typeof template.confidence_bias === "string" ? template.confidence_bias : null,
    ambiguity_count: Number.isInteger(template.ambiguity_count) ? template.ambiguity_count : 0,
    repair_count: Number.isInteger(template.repair_count) ? template.repair_count : 0,
    pending_recovery: Boolean(template.pending_recovery),
    parked_side_questions: Array.isArray(template.parked_side_questions) ? [...template.parked_side_questions] : [],
    completion_condition:
      typeof template.completion_condition === "string"
        ? template.completion_condition
        : activeChunk?.completion_condition || null,
    partial_progress: template.partial_progress || null,
    paused_reason: template.paused_reason || null,
    hold_reason: template.hold_reason || null,
    recent_signals: Array.isArray(template.recent_signals) ? [...template.recent_signals] : [],
    metrics_snapshot: template.metrics_snapshot || null,
    submit_mode: typeof template.submit_mode === "string" ? template.submit_mode : "disabled",
    chunk_completion: chunkCompletion,
    processed_event_ids: Array.isArray(template.processed_event_ids) ? [...template.processed_event_ids] : []
  };
}

module.exports = {
  buildReducerStateFromFixture
};
