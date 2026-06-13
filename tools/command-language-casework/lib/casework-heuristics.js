const CASEWORK_HEURISTICS_VERSION = "heuristics-route-alias-boundary-v3";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRouteText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePacket(packetText) {
  const input = String(packetText || "").trim();
  const jsonStart = input.indexOf("{");
  if (jsonStart === -1) {
    return null;
  }

  try {
    return JSON.parse(input.slice(jsonStart));
  } catch (_error) {
    return null;
  }
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseBoundaryRegex(value) {
  const normalized = normalizeRouteText(value);
  if (!normalized) {
    return null;
  }

  const pattern = normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => escapeRegExp(part))
    .join("[\\s_-]+");

  return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, "i");
}

function hasPhraseBoundary(haystack, needle) {
  const regex = phraseBoundaryRegex(needle);
  if (!regex) {
    return false;
  }
  return regex.test(normalizeRouteText(haystack));
}

const ROUTE_CHUNK_ALIASES = {
  "desk-reset-v0": {
    clear_trash: ["clear_trash", "clear trash"],
    collect_dishes: ["collect_dishes", "collect dishes"],
    stack_papers: ["stack_papers", "stack papers"],
    wipe_surface: ["wipe_surface", "wipe surface"],
    choose_next_work_item: ["choose_next_work_item", "choose next work item"]
  }
};

const ROUTE_CHUNK_ORDER = {
  "desk-reset-v0": [
    "clear_trash",
    "collect_dishes",
    "stack_papers",
    "wipe_surface",
    "choose_next_work_item"
  ]
};

const INTENT_ALIASES = {
  continue: ["continue"],
  pause: ["pause"],
  done: ["done"],
  move_on: ["move_on", "move on"],
  next: ["next"]
};

function getChunkAliasMap(routeId) {
  return ROUTE_CHUNK_ALIASES[routeId] || {};
}

function getChunkAliases(routeId, chunkId, chunkLabel = "") {
  const aliasMap = getChunkAliasMap(routeId);
  const direct = aliasMap[chunkId] || [];
  const dynamic = [chunkId, chunkLabel].filter(Boolean);
  return unique([...direct, ...dynamic]);
}

function findChunkIdForText(routeId, text) {
  const aliasMap = getChunkAliasMap(routeId);
  for (const [chunkId, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((alias) => hasPhraseBoundary(text, alias))) {
      return chunkId;
    }
  }
  return null;
}

function hasAnyAlias(text, aliases) {
  return aliases.some((alias) => hasPhraseBoundary(text, alias));
}

function hasIntent(textOrReplies, intentKey) {
  const aliases = INTENT_ALIASES[intentKey] || [];
  if (!aliases.length) {
    return false;
  }

  if (Array.isArray(textOrReplies)) {
    return textOrReplies.some((entry) => aliases.some((alias) => hasPhraseBoundary(entry, alias)));
  }

  return aliases.some((alias) => hasPhraseBoundary(textOrReplies, alias));
}

function getExpectedNextChunkId(routeId, activeChunkId) {
  const order = ROUTE_CHUNK_ORDER[routeId];
  if (!order || !activeChunkId) {
    return null;
  }
  const index = order.indexOf(activeChunkId);
  if (index === -1 || index + 1 >= order.length) {
    return null;
  }
  return order[index + 1];
}

function classifyCaseResult(caseRecord) {
  if (caseRecord.tool_failure_label) {
    return {
      label: caseRecord.tool_failure_label,
      reasons: [caseRecord.notes || "Runner tool failure."]
    };
  }

  if (caseRecord.case_status === "NOT_SENT") {
    return {
      label: "TOOL_FAIL_MESSAGE_NOT_SENT",
      reasons: [caseRecord.notes || "Runner never submitted the case packet."]
    };
  }

  const assistantResponses = Array.isArray(caseRecord.assistant_responses)
    ? caseRecord.assistant_responses
    : [];
  const combined = normalizeRouteText(assistantResponses.join("\n"));
  const packet = parsePacket(caseRecord.packet_sent || caseRecord.packet || "");
  const routeId = packet?.route_id || caseRecord.route_id || "desk-reset-v0";
  const activeChunkId = packet?.active_chunk_id || "";
  const activeChunkLabel = packet?.active_chunk_label || "";
  const activeChunkAliases = getChunkAliases(routeId, activeChunkId, activeChunkLabel);
  const activeChunkCanonicalId = findChunkIdForText(routeId, activeChunkId || activeChunkLabel) || activeChunkId;
  const expectedNextChunkId = getExpectedNextChunkId(routeId, activeChunkCanonicalId);
  const expectedNextChunkAliases = expectedNextChunkId ? getChunkAliases(routeId, expectedNextChunkId) : [];
  const userReplies = Array.isArray(caseRecord.scripted_user_replies_sent)
    ? caseRecord.scripted_user_replies_sent.map(normalizeRouteText)
    : [];
  const forbidden = Array.isArray(caseRecord.forbidden_behavior)
    ? caseRecord.forbidden_behavior.map(normalizeRouteText)
    : [];
  const reasons = [];

  const transportConfusionTokens = [
    "milestone 7",
    "transport",
    "insert-only",
    "insert only",
    "packet arrived",
    "composer",
    "extension can insert"
  ];

  const mentionsActiveChunk = hasAnyAlias(combined, activeChunkAliases);
  const mentionsExpectedNextChunk = expectedNextChunkAliases.length > 0 && hasAnyAlias(combined, expectedNextChunkAliases);
  const moveIntentObserved = hasIntent(userReplies, "move_on") || hasIntent(userReplies, "next");

  if (
    transportConfusionTokens.some((token) => hasPhraseBoundary(combined, token)) &&
    !mentionsActiveChunk &&
    !mentionsExpectedNextChunk
  ) {
    reasons.push("Assistant discussed transport instead of route state.");
    return {
      label: "FAIL_NO_ROUTE_ENGAGEMENT",
      reasons
    };
  }

  if (
    !moveIntentObserved &&
    (hasAnyAlias(combined, getChunkAliases(routeId, "collect_dishes")) ||
      hasAnyAlias(combined, getChunkAliases(routeId, "stack_papers")) ||
      hasAnyAlias(combined, getChunkAliases(routeId, "wipe_surface")) ||
      hasAnyAlias(combined, getChunkAliases(routeId, "choose_next_work_item")))
  ) {
    reasons.push("Assistant advanced to a later chunk before move_on/next.");
    return {
      label: "FAIL_ADVANCED_WITHOUT_PERMISSION",
      reasons
    };
  }

  if (
    hasPhraseBoundary(combined, "complete") &&
    hasAnyAlias(combined, getChunkAliases(routeId, "clear_trash")) &&
    !hasIntent(userReplies, "done")
  ) {
    reasons.push("Assistant claimed completion without a matching done reply.");
    return {
      label: "FAIL_INVENTED_PROGRESS",
      reasons
    };
  }

  if (moveIntentObserved && mentionsExpectedNextChunk) {
    reasons.push("Assistant advanced exactly one chunk to the expected next route state.");
    return {
      label: "PASS_CANDIDATE",
      reasons
    };
  }

  if (
    activeChunkAliases.length > 0 &&
    !mentionsActiveChunk &&
    !mentionsExpectedNextChunk &&
    userReplies.length > 0
  ) {
    reasons.push("Assistant stopped naming the active route/chunk after replies.");
    return {
      label: "FAIL_LOST_ROUTE",
      reasons
    };
  }

  const matchedForbidden = forbidden.filter((entry) => entry && hasPhraseBoundary(combined, entry));
  if (matchedForbidden.length > 0) {
    reasons.push(`Forbidden behavior matched: ${matchedForbidden.join(", ")}`);
    return {
      label: "HOLD_NEEDS_REVIEW",
      reasons
    };
  }

  if (mentionsActiveChunk) {
    reasons.push("Assistant stayed inside the expected route vocabulary.");
    return {
      label: "PASS_CANDIDATE",
      reasons
    };
  }

  reasons.push("No obvious failure pattern matched, but the result needs review.");
  return {
    label: "HOLD_NEEDS_REVIEW",
    reasons
  };
}

function extractObservedKeywords(caseRecord) {
  const packet = parsePacket(caseRecord.packet_sent || caseRecord.packet || "");
  const routeId = packet?.route_id || caseRecord.route_id || "desk-reset-v0";
  const responseText = normalizeRouteText((caseRecord.assistant_responses || []).join(" "));
  const tokens = [];

  const chunkAliasMap = getChunkAliasMap(routeId);
  for (const [chunkId, aliases] of Object.entries(chunkAliasMap)) {
    if (hasAnyAlias(responseText, aliases)) {
      tokens.push(chunkId);
    }
  }

  if (hasIntent(responseText, "pause")) {
    tokens.push("pause");
  }
  if (hasIntent(responseText, "continue")) {
    tokens.push("continue");
  }
  if (hasIntent(responseText, "done")) {
    tokens.push("done");
  }
  if (hasIntent(responseText, "move_on")) {
    tokens.push("move_on");
  }
  if (hasIntent(responseText, "next")) {
    tokens.push("next");
  }

  return unique(tokens);
}

function deriveDeterministicCaseSignals(caseRecord) {
  const observedChunksOrKeywords = extractObservedKeywords(caseRecord);
  const heuristic = classifyCaseResult({
    ...caseRecord,
    observed_chunks_or_keywords: observedChunksOrKeywords
  });

  return {
    classification: heuristic.label,
    reasons: Array.isArray(heuristic.reasons) ? heuristic.reasons : [],
    observed_chunks_or_keywords: observedChunksOrKeywords
  };
}

const api = {
  CASEWORK_HEURISTICS_VERSION,
  ROUTE_CHUNK_ALIASES,
  classifyCaseResult,
  deriveDeterministicCaseSignals,
  escapeRegExp,
  extractObservedKeywords,
  findChunkIdForText,
  getExpectedNextChunkId,
  hasPhraseBoundary,
  normalizeRouteText,
  normalizeText,
  parsePacket,
  phraseBoundaryRegex
};

if (typeof module === "object" && module.exports) {
  module.exports = api;
}

if (typeof globalThis !== "undefined") {
  globalThis.OrionCaseworkHeuristics = api;
}
