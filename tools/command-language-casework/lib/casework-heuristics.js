function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
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
  const combined = normalizeText(assistantResponses.join("\n"));
  const packet = parsePacket(caseRecord.packet_sent || caseRecord.packet || "");
  const activeChunkLabel = normalizeText(packet?.active_chunk_label || "");
  const activeChunkId = normalizeText(packet?.active_chunk_id || "");
  const userReplies = Array.isArray(caseRecord.scripted_user_replies_sent)
    ? caseRecord.scripted_user_replies_sent.map(normalizeText)
    : [];
  const forbidden = Array.isArray(caseRecord.forbidden_behavior)
    ? caseRecord.forbidden_behavior.map(normalizeText)
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

  if (
    transportConfusionTokens.some((token) => combined.includes(token)) &&
    !combined.includes(activeChunkLabel) &&
    !combined.includes(activeChunkId)
  ) {
    reasons.push("Assistant discussed transport instead of route state.");
    return {
      label: "FAIL_NO_ROUTE_ENGAGEMENT",
      reasons
    };
  }

  if (
    !userReplies.includes("move_on") &&
    !userReplies.includes("next") &&
    (combined.includes("collect dishes") || combined.includes("stack papers"))
  ) {
    reasons.push("Assistant advanced to a later chunk before move_on/next.");
    return {
      label: "FAIL_ADVANCED_WITHOUT_PERMISSION",
      reasons
    };
  }

  if (
    combined.includes("complete") &&
    combined.includes("clear trash") &&
    !userReplies.includes("done")
  ) {
    reasons.push("Assistant claimed completion without a matching done reply.");
    return {
      label: "FAIL_INVENTED_PROGRESS",
      reasons
    };
  }

  if (
    activeChunkLabel &&
    !combined.includes(activeChunkLabel) &&
    !combined.includes(activeChunkId) &&
    userReplies.length > 0
  ) {
    reasons.push("Assistant stopped naming the active route/chunk after replies.");
    return {
      label: "FAIL_LOST_ROUTE",
      reasons
    };
  }

  const matchedForbidden = forbidden.filter((entry) => entry && combined.includes(entry));
  if (matchedForbidden.length > 0) {
    reasons.push(`Forbidden behavior matched: ${matchedForbidden.join(", ")}`);
    return {
      label: "HOLD_NEEDS_REVIEW",
      reasons
    };
  }

  if (
    activeChunkLabel &&
    (combined.includes(activeChunkLabel) || combined.includes(activeChunkId))
  ) {
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
  const responseText = normalizeText((caseRecord.assistant_responses || []).join(" "));
  const tokens = [];

  for (const candidate of [
    packet?.active_chunk_id,
    packet?.active_chunk_label,
    "clear trash",
    "collect dishes",
    "stack papers",
    "pause",
    "continue",
    "done",
    "move_on",
    "next"
  ]) {
    if (candidate && responseText.includes(normalizeText(candidate))) {
      tokens.push(candidate);
    }
  }

  return unique(tokens);
}

module.exports = {
  classifyCaseResult,
  extractObservedKeywords,
  normalizeText,
  parsePacket
};
