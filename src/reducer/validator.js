const CORE_USER_INTENTS = new Set(["done", "move_on", "continue", "stuck", "pause", "re_chunk"]);
const RECOVERY_SYSTEM_EVENTS = new Set([
  "side_question",
  "return_to_route",
  "recovery_signal",
  "repair_packet",
  "terminal_commit"
]);
const SYSTEM_EVENTS = new Set(["start"]);
const KNOWN_EVENT_TYPES = new Set([...CORE_USER_INTENTS, ...RECOVERY_SYSTEM_EVENTS, ...SYSTEM_EVENTS]);

function validateReducerEvent(event, state = {}) {
  const guardsEvaluated = [
    "event_shape_guard",
    "event_id_guard",
    "known_event_type_guard",
    "route_id_guard",
    "session_id_guard",
    "stale_event_guard",
    "event_dedupe_guard",
    "intent_scope_guard",
    "allowed_intent_guard"
  ];
  const guardResults = {};

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    guardResults.event_shape_guard = false;
    return invalid("malformed_event", "reject");
  }
  guardResults.event_shape_guard = true;

  if (typeof event.event_id !== "string" || event.event_id.trim().length === 0) {
    guardResults.event_id_guard = false;
    return invalid("missing_event_id", "reject");
  }
  guardResults.event_id_guard = true;

  if (typeof event.type !== "string" || !KNOWN_EVENT_TYPES.has(event.type)) {
    guardResults.known_event_type_guard = false;
    return invalid("unsupported_intent", "reject");
  }
  guardResults.known_event_type_guard = true;

  if (typeof event.route_id === "string" && typeof state.route_id === "string" && event.route_id !== state.route_id) {
    guardResults.route_id_guard = false;
    return invalid("route_mismatch", "reject");
  }
  guardResults.route_id_guard = true;

  if (
    typeof event.session_id === "string" &&
    typeof state.session_id === "string" &&
    event.session_id !== state.session_id
  ) {
    guardResults.session_id_guard = false;
    return invalid("session_mismatch", "reject");
  }
  guardResults.session_id_guard = true;

  if (Number.isInteger(event.state_version_seen) && Number.isInteger(state.state_version)) {
    if (event.state_version_seen < state.state_version) {
      guardResults.stale_event_guard = false;
      return invalid("stale_event", "reject");
    }
  }
  guardResults.stale_event_guard = true;

  const processedEventIds = Array.isArray(state.processed_event_ids) ? state.processed_event_ids : [];
  if (state.last_event_id === event.event_id || processedEventIds.includes(event.event_id)) {
    guardResults.event_dedupe_guard = false;
    return invalid("duplicate_event", "reject");
  }
  guardResults.event_dedupe_guard = true;

  const normalizedIntent = normalizeIntent(event);
  const eventClass = classifyEvent(normalizedIntent);
  guardResults.intent_scope_guard = Boolean(eventClass);
  if (!guardResults.intent_scope_guard) {
    return invalid("unsupported_intent", "reject");
  }

  if (eventClass === "core_user_intent") {
    const allowed = Array.isArray(state.allowed_intents) ? state.allowed_intents : [];
    if (!allowed.includes(normalizedIntent)) {
      guardResults.allowed_intent_guard = false;
      return invalid("unsupported_intent", "reject");
    }
  }

  if (eventClass === "recovery_system_event") {
    const allowedEvents = Array.isArray(state.reducer_event_types) ? state.reducer_event_types : [];
    if (allowedEvents.length > 0 && !allowedEvents.includes(event.type)) {
      guardResults.allowed_intent_guard = false;
      return invalid("unsupported_intent", "reject");
    }
  }

  guardResults.allowed_intent_guard = true;

  return {
    ok: true,
    normalized_intent: normalizedIntent,
    event_class: eventClass,
    source_event_id: event.event_id,
    guards_evaluated: guardsEvaluated,
    guard_results: guardResults
  };
}

function normalizeIntent(event) {
  if (event.type === "move_on") {
    const utterance = typeof event.utterance === "string" ? event.utterance.trim().toLowerCase() : "";
    if (utterance === "next" || utterance === "move on" || utterance === "move_on") {
      return "move_on";
    }
  }
  if (event.type === "repair_packet") return "repair";
  return event.type;
}

function classifyEvent(normalizedIntent) {
  if (CORE_USER_INTENTS.has(normalizedIntent)) return "core_user_intent";
  if (normalizedIntent === "start") return "system_event";
  if (["side_question", "return_to_route", "recovery_signal", "repair", "terminal_commit"].includes(normalizedIntent)) {
    return "recovery_system_event";
  }
  return null;
}

function invalid(reason, effect) {
  return {
    ok: false,
    reason,
    effect,
    normalized_intent: null,
    event_class: null,
    source_event_id: null,
    guards_evaluated: [],
    guard_results: {}
  };
}

module.exports = {
  CORE_USER_INTENTS,
  KNOWN_EVENT_TYPES,
  RECOVERY_SYSTEM_EVENTS,
  validateReducerEvent
};
