#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import heuristicsApi from "../lib/casework-heuristics.js";
import {
  deriveFailureLayer,
  deriveLegalFields
} from "../lib/casework-legal-fields.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");
const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
const studyDir = path.join(caseworkRoot, "study");
const rawDir = path.join(studyDir, "raw");
const reviewsDir = path.join(studyDir, "reviews");
const caseLawDir = path.join(studyDir, "case-law");
const {
  ROUTE_CHUNK_ALIASES,
  deriveDeterministicCaseSignals,
  findChunkIdForText,
  getExpectedNextChunkId,
  hasPhraseBoundary
} = heuristicsApi;

const MATRIX_FIELDS = [
  "suite_id",
  "case_id",
  "run_id",
  "run_date",
  "suite_case_count",
  "suite_design_type",
  "suite_context_risk",
  "case_index_in_suite",
  "case_order",
  "prior_cases_in_same_run",
  "case_context_isolation",
  "scripted_reply_count",
  "assistant_turn_count_in_case",
  "user_turn_count_in_case",
  "approximate_chat_turn_depth_before_case",
  "negative_control_position",
  "route_id",
  "active_chunk_id",
  "active_chunk_label",
  "boundary_type",
  "packet_style",
  "steering_language",
  "scripted_user_reply",
  "expected_behavior",
  "forbidden_behavior",
  "observed_behavior",
  "classification",
  "failure_layer",
  "failure_class",
  "tool_status",
  "scorer_status",
  "language_status",
  "transport_status",
  "repair_needed",
  "repair_worked",
  "assistant_stable_seen",
  "thinking_waited_out",
  "send_activation_status",
  "important_excerpt",
  "visible_turn_excerpt",
  "latest_assistant_excerpt",
  "observed_chunks_or_keywords",
  "exact_chunk_id_seen",
  "human_label_seen",
  "semantic_alias_seen",
  "route_behavior_correct_without_keyword",
  "assistant_overexplained",
  "assistant_evaluated_transport",
  "legal_verdict",
  "legal_evidence_type",
  "claim_vs_state_conflict",
  "smallest_legal_reduction",
  "route_survival_outcome",
  "candidate_rule",
  "candidate_skill_block",
  "next_status",
  "notes",
  "source_result_path",
  "source_review_path"
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  for (const fileName of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, fileName);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findJsonFiles(fullPath, fileList);
      continue;
    }
    if (fileName.endsWith(".json")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function escapeCsv(value) {
  if (value == null) {
    return "";
  }
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function joinList(value) {
  return Array.isArray(value) ? value.map((item) => cleanText(item)).filter(Boolean).join(" | ") : "";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

function getCaseClassification(caseResult) {
  const deterministic = deriveDeterministicCaseSignals(caseResult);
  if (deterministic.classification) {
    return deterministic.classification;
  }
  const fields = [
    caseResult.classification,
    caseResult.final_classification,
    caseResult.result_classification,
    caseResult.heuristic_classification,
    caseResult.tool_failure_label,
    caseResult.tool_classification,
    caseResult.assistant_classification
  ];
  for (const field of fields) {
    if (typeof field === "string" && field.trim()) {
      return field.trim();
    }
  }
  return "UNKNOWN";
}

function deriveRunDate(runData, runId) {
  const source = runData.started_at || runData.completed_at || runId || "";
  const isoMatch = String(source).match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return isoMatch[1];
  }
  const compactMatch = String(runId || "").match(/^(\d{4})(\d{2})(\d{2})/);
  if (compactMatch) {
    return `${compactMatch[1]}-${compactMatch[2]}-${compactMatch[3]}`;
  }
  return "";
}

function parsePacket(packetText) {
  const rawText = String(packetText || "").trim();
  if (!rawText) {
    return {
      packetStyle: "",
      packetPayload: null,
      responseContract: []
    };
  }

  const firstNewlineIndex = rawText.indexOf("\n");
  const packetStyle = firstNewlineIndex === -1 ? rawText : rawText.slice(0, firstNewlineIndex).trim();
  const jsonPart = firstNewlineIndex === -1 ? "" : rawText.slice(firstNewlineIndex + 1).trim();

  let packetPayload = null;
  if (jsonPart) {
    try {
      packetPayload = JSON.parse(jsonPart);
    } catch (_error) {
      packetPayload = null;
    }
  }

  return {
    packetStyle,
    packetPayload,
    responseContract: Array.isArray(packetPayload?.response_contract)
      ? packetPayload.response_contract
      : []
  };
}

function getReviewPathForResult(resultPath) {
  const relativeResultPath = path.relative(rawDir, resultPath);
  const reviewPath = path.join(reviewsDir, relativeResultPath).replace(/\.json$/i, ".md");
  return fs.existsSync(reviewPath) ? reviewPath : null;
}

function lastAssistantExcerpt(caseResult) {
  const domTrace = Array.isArray(caseResult.dom_turn_trace) ? caseResult.dom_turn_trace : [];
  for (let index = domTrace.length - 1; index >= 0; index -= 1) {
    const excerpt = cleanText(domTrace[index]?.latest_assistant_text_excerpt);
    if (excerpt) {
      return excerpt;
    }
  }
  const assistantResponses = Array.isArray(caseResult.assistant_responses) ? caseResult.assistant_responses : [];
  return cleanText(assistantResponses[assistantResponses.length - 1] || "");
}

function deriveEvidenceText(caseResult) {
  return cleanText(caseResult.visible_turn_text || lastAssistantExcerpt(caseResult) || joinList(caseResult.assistant_responses));
}

function deriveBoundaryType(caseResult, packetPayload) {
  const haystack = cleanText([
    caseResult.case_id,
    caseResult.title,
    caseResult.research_question,
    packetPayload?.commit_policy,
    packetPayload?.active_chunk_id,
    joinList(packetPayload?.allowed_intents)
  ].join(" "));
  if (/scorer|keyword/.test(haystack)) {
    return "scorer_recognition_boundary";
  }
  if (/move_on|next|advance/.test(haystack)) {
    return "route_advancement_boundary";
  }
  if (/\bdone\b|complete/.test(haystack)) {
    return "completion_boundary";
  }
  if (/pause|hold|stuck/.test(haystack)) {
    return "hold_boundary";
  }
  return "unknown";
}

function isNegativeControlCase(caseResult) {
  const haystack = cleanText([
    caseResult.case_id,
    caseResult.title,
    caseResult.research_question,
    joinList(caseResult.forbidden_behavior)
  ].join(" "));
  return /negative|wrong next|wrong-next|must not|forbidden/i.test(haystack);
}

function deriveCaseOrder(index, total) {
  if (total <= 2) {
    return index === 0 ? "early" : "late";
  }
  const ratio = total <= 1 ? 0 : index / (total - 1);
  if (ratio <= 0.34) {
    return "early";
  }
  if (ratio >= 0.67) {
    return "late";
  }
  return "middle";
}

function deriveSuiteDesignType(runData, cases) {
  const suiteCaseCount = Array.isArray(cases) ? cases.length : 0;
  const haystack = cleanText([
    runData?.suite_id,
    runData?.suite_title,
    runData?.suite_goal,
    runData?.notes,
    Array.isArray(cases) ? cases.map((caseResult) => caseResult.title || caseResult.research_question || "").join(" ") : ""
  ].join(" "));

  if (/endurance|fatigue|carryover|long context|long-context|degradation/.test(haystack)) {
    return "endurance";
  }
  if (/matrix|relaxation|contrast|compare|strict|relaxed|versus|\bvs\b/.test(haystack)) {
    return "matrix";
  }
  if (/exploratory|mapping|survey/.test(haystack)) {
    return "exploratory";
  }
  if (/regression|repair|fix/.test(haystack)) {
    return "regression";
  }
  if (/smoke|validator|sanity|baseline/.test(haystack)) {
    return "smoke";
  }
  if (suiteCaseCount <= 3) {
    return "smoke";
  }
  if (suiteCaseCount <= 5) {
    return "contrast";
  }
  if (suiteCaseCount <= 10) {
    return "matrix";
  }
  return "endurance";
}

function deriveSuiteContextRisk(cases) {
  const suiteCaseCount = Array.isArray(cases) ? cases.length : 0;
  const totalScriptedReplies = (Array.isArray(cases) ? cases : []).reduce((sum, caseResult) => {
    const replies = Array.isArray(caseResult.scripted_user_replies_sent)
      ? caseResult.scripted_user_replies_sent
      : Array.isArray(caseResult.scripted_user_replies)
        ? caseResult.scripted_user_replies
        : [];
    return sum + replies.length;
  }, 0);

  if (suiteCaseCount <= 3 && totalScriptedReplies <= 3) {
    return "low";
  }
  if (suiteCaseCount >= 8 || totalScriptedReplies >= 10) {
    return "high";
  }
  return "medium";
}

function deriveNegativeControlPosition(caseResult, index, total) {
  if (!isNegativeControlCase(caseResult)) {
    return "none";
  }
  return deriveCaseOrder(index, total);
}

function getChunkAliases(routeId, chunkId, chunkLabel = "") {
  const aliasMap = ROUTE_CHUNK_ALIASES[routeId] || {};
  return unique([...(aliasMap[chunkId] || []), chunkId, chunkLabel]);
}

function hasAnyAlias(text, aliases) {
  return aliases.some((alias) => hasPhraseBoundary(text, alias));
}

function extractChunkSignals(caseResult, packetPayload, deterministic) {
  const observedText = cleanText([
    caseResult.visible_turn_text,
    joinList(caseResult.assistant_responses),
    joinList(caseResult.observed_chunks_or_keywords)
  ].join(" "));
  const routeId = packetPayload?.route_id || "desk-reset-v0";
  const activeChunkCanonicalId =
    findChunkIdForText(routeId, packetPayload?.active_chunk_id || packetPayload?.active_chunk_label || "") ||
    packetPayload?.active_chunk_id ||
    "";
  const expectedNextChunkId = getExpectedNextChunkId(routeId, activeChunkCanonicalId) || "";
  const expectedAliases = getChunkAliases(routeId, expectedNextChunkId);
  const observedChunkIds = unique(
    (Array.isArray(deterministic?.observed_chunks_or_keywords) ? deterministic.observed_chunks_or_keywords : []).filter(
      (token) => Boolean((ROUTE_CHUNK_ALIASES[routeId] || {})[token])
    )
  );
  const humanLabel = expectedNextChunkId.replace(/_/g, " ");
  const exactChunkIdSeen = expectedNextChunkId ? observedChunkIds.includes(expectedNextChunkId) : false;
  const humanLabelSeen = expectedAliases.length > 0 ? hasAnyAlias(observedText, expectedAliases) : false;
  const semanticAliasSeen = humanLabelSeen && expectedNextChunkId ? !exactChunkIdSeen : humanLabelSeen;
  const observedWrongNextChunk = observedChunkIds.some(
    (chunkId) => chunkId !== activeChunkCanonicalId && chunkId !== expectedNextChunkId
  );

  return {
    canonicalId: expectedNextChunkId,
    humanLabel,
    exactChunkIdSeen,
    humanLabelSeen,
    semanticAliasSeen,
    observedWrongNextChunk
  };
}

function deriveFailureClass(classification, failureLayer) {
  if (failureLayer === "none") {
    return "";
  }
  if (failureLayer === "tool" || failureLayer === "transport") {
    return classification || "tool_failure";
  }
  if (failureLayer === "scorer") {
    return "classification_false_negative_candidate";
  }
  if (failureLayer === "language") {
    return classification;
  }
  return classification || "";
}

function deriveStatuses({ classification, failureLayer, routeBehaviorCorrectWithoutKeyword, diagnostics }) {
  const transportStatus = diagnostics?.sendActivationStatus || "unknown";
  const toolStatus = classification.startsWith("TOOL_FAIL_")
    ? classification
    : transportStatus !== "passed"
      ? "runner_setup_warning"
      : "passed";
  const scorerStatus = failureLayer === "scorer"
    ? "false_negative_candidate"
    : /PASS/.test(classification)
      ? "pass_candidate"
      : "not_evaluated";
  const languageStatus = failureLayer === "language"
    ? "route_broken"
    : routeBehaviorCorrectWithoutKeyword
      ? "route_survived"
      : /PASS/.test(classification)
        ? "route_survived"
        : "unknown";
  return {
    toolStatus,
    scorerStatus,
    languageStatus,
    transportStatus
  };
}

function buildCaseLawRow({ runData, caseResult, resultPath, caseIndex, suiteCaseCount, suiteDesignType, suiteContextRisk, approximateChatTurnDepthBeforeCase }) {
  const deterministic = deriveDeterministicCaseSignals(caseResult);
  const classification = deterministic.classification || getCaseClassification(caseResult);
  const runDate = deriveRunDate(runData, runData.run_id);
  const reviewPath = getReviewPathForResult(resultPath);
  const resultRelativePath = path.relative(caseworkRoot, resultPath);
  const reviewRelativePath = reviewPath ? path.relative(caseworkRoot, reviewPath) : "";
  const { packetStyle, packetPayload, responseContract } = parsePacket(caseResult.packet_sent || caseResult.packet_prepared);
  const observedBehavior = joinList(caseResult.assistant_responses);
  const visibleTurnExcerpt = cleanText(caseResult.visible_turn_text);
  const latestAssistantExcerpt = lastAssistantExcerpt(caseResult);
  const evidenceText = deriveEvidenceText({
    ...caseResult,
    observed_chunks_or_keywords: deterministic.observed_chunks_or_keywords
  });
  const chunkSignals = extractChunkSignals(caseResult, packetPayload, deterministic);
  const routeBehaviorCorrectWithoutKeyword =
    Boolean(chunkSignals.exactChunkIdSeen || chunkSignals.humanLabelSeen) &&
    !chunkSignals.observedWrongNextChunk &&
    /FAIL_LOST_ROUTE/.test(classification);
  const diagnostics = caseResult.diagnostics || {};
  const failureLayer = deriveFailureLayer({
    classification,
    routeBehaviorCorrectWithoutKeyword,
    diagnostics,
    caseResult
  });
  const failureClass = deriveFailureClass(classification, failureLayer);
  const statuses = deriveStatuses({
    classification,
    failureLayer,
    routeBehaviorCorrectWithoutKeyword,
    diagnostics
  });
  const legalFields = deriveLegalFields({
    classification,
    failureLayer,
    routeBehaviorCorrectWithoutKeyword,
    diagnostics
  });
  const assistantStableSeen = Array.isArray(caseResult.dom_turn_trace)
    ? caseResult.dom_turn_trace.some((entry) => entry?.action_taken === "assistant_stable")
    : false;
  const thinkingWaitedOut = Array.isArray(caseResult.dom_turn_trace)
    ? caseResult.dom_turn_trace.some((entry) => entry?.action_taken === "assistant_thinking_seen") && assistantStableSeen
    : false;
  const assistantEvaluatedTransport = /send|button|transport|runner|overlay/i.test(observedBehavior);
  const assistantOverexplained = cleanText(observedBehavior).length > 220;
  const claimVsStateConflict = routeBehaviorCorrectWithoutKeyword ? "true" : "false";
  const scriptedUserReplies = Array.isArray(caseResult.scripted_user_replies_sent)
    ? caseResult.scripted_user_replies_sent
    : Array.isArray(caseResult.scripted_user_replies)
      ? caseResult.scripted_user_replies
      : [];
  const assistantResponses = Array.isArray(caseResult.assistant_responses) ? caseResult.assistant_responses : [];
  const caseOrder = deriveCaseOrder(caseIndex, suiteCaseCount);

  return {
    suite_id: runData.suite_id || "",
    case_id: caseResult.case_id || "",
    run_id: runData.run_id || "",
    run_date: runDate,
    suite_case_count: String(suiteCaseCount || 0),
    suite_design_type: suiteDesignType,
    suite_context_risk: suiteContextRisk,
    case_index_in_suite: String(caseIndex + 1),
    case_order: caseOrder,
    prior_cases_in_same_run: String(caseIndex),
    case_context_isolation: caseIndex === 0 ? "isolated_first_case" : "carryover_context_present",
    scripted_reply_count: String(scriptedUserReplies.length),
    assistant_turn_count_in_case: String(assistantResponses.length),
    user_turn_count_in_case: String(scriptedUserReplies.length),
    approximate_chat_turn_depth_before_case: String(approximateChatTurnDepthBeforeCase),
    negative_control_position: deriveNegativeControlPosition(caseResult, caseIndex, suiteCaseCount),
    route_id: packetPayload?.route_id || "",
    active_chunk_id: packetPayload?.active_chunk_id || "",
    active_chunk_label: packetPayload?.active_chunk_label || "",
    boundary_type: deriveBoundaryType(caseResult, packetPayload),
    packet_style: packetStyle || "",
    steering_language: joinList(responseContract),
    scripted_user_reply: joinList(caseResult.scripted_user_replies_sent),
    expected_behavior: joinList(caseResult.expected_behavior),
    forbidden_behavior: joinList(caseResult.forbidden_behavior),
    observed_behavior: observedBehavior,
    classification,
    failure_layer: failureLayer,
    failure_class: failureClass,
    tool_status: statuses.toolStatus,
    scorer_status: statuses.scorerStatus,
    language_status: statuses.languageStatus,
    transport_status: statuses.transportStatus,
    repair_needed: failureLayer === "tool" || failureLayer === "transport" ? "true" : "false",
    repair_worked: /PASS_WITH_REPAIR/.test(classification) ? "true" : "false",
    assistant_stable_seen: assistantStableSeen ? "true" : "false",
    thinking_waited_out: thinkingWaitedOut ? "true" : "false",
    send_activation_status: diagnostics?.sendActivationStatus || "unknown",
    important_excerpt: evidenceText,
    visible_turn_excerpt: visibleTurnExcerpt,
    latest_assistant_excerpt: latestAssistantExcerpt,
    observed_chunks_or_keywords: joinList(deterministic.observed_chunks_or_keywords),
    exact_chunk_id_seen: chunkSignals.exactChunkIdSeen ? "true" : "false",
    human_label_seen: chunkSignals.humanLabelSeen ? "true" : "false",
    semantic_alias_seen: chunkSignals.semanticAliasSeen ? "true" : "false",
    route_behavior_correct_without_keyword: routeBehaviorCorrectWithoutKeyword ? "true" : "false",
    assistant_overexplained: assistantOverexplained ? "true" : "false",
    assistant_evaluated_transport: assistantEvaluatedTransport ? "true" : "false",
    legal_verdict: legalFields.legalVerdict,
    legal_evidence_type: legalFields.legalEvidenceType,
    claim_vs_state_conflict: claimVsStateConflict,
    smallest_legal_reduction: legalFields.smallestLegalReduction,
    route_survival_outcome: legalFields.routeSurvivalOutcome,
    candidate_rule: packetPayload?.commit_policy || "",
    candidate_skill_block: cleanText(caseResult.research_question || caseResult.title || ""),
    next_status: reviewPath ? "review_present" : "review_required",
    notes: cleanText(caseResult.notes),
    source_result_path: resultRelativePath,
    source_review_path: reviewRelativePath
  };
}

function buildCaseLawMatrixRows() {
  const resultPaths = findJsonFiles(rawDir).sort();
  const rows = [];
  for (const resultPath of resultPaths) {
    let runData;
    try {
      runData = readJson(resultPath);
    } catch (error) {
      console.error(`Skipping unreadable result file ${resultPath}: ${error.message}`);
      continue;
    }
    if (!runData?.suite_id || !runData?.run_id) {
      continue;
    }
    const cases = Array.isArray(runData.cases) ? runData.cases : [];
    const suiteCaseCount = cases.length;
    const suiteDesignType = deriveSuiteDesignType(runData, cases);
    const suiteContextRisk = deriveSuiteContextRisk(cases);
    let approximateChatTurnDepthBeforeCase = 0;
    cases.forEach((caseResult, caseIndex) => {
      rows.push(
        buildCaseLawRow({
          runData,
          caseResult,
          resultPath,
          caseIndex,
          suiteCaseCount,
          suiteDesignType,
          suiteContextRisk,
          approximateChatTurnDepthBeforeCase
        })
      );
      const assistantTurns = Array.isArray(caseResult.assistant_responses) ? caseResult.assistant_responses.length : 0;
      const userTurns = Array.isArray(caseResult.scripted_user_replies_sent)
        ? caseResult.scripted_user_replies_sent.length
        : Array.isArray(caseResult.scripted_user_replies)
          ? caseResult.scripted_user_replies.length
          : 0;
      approximateChatTurnDepthBeforeCase += assistantTurns + userTurns;
    });
  }
  return rows;
}

function writeMatrixOutputs(rows) {
  ensureDir(caseLawDir);

  const csvPath = path.join(caseLawDir, "CASEWORK_CASE_LAW_MATRIX_V1.csv");
  const jsonlPath = path.join(caseLawDir, "CASEWORK_CASE_LAW_MATRIX_V1.jsonl");
  const mdPath = path.join(caseLawDir, "CASEWORK_CASE_LAW_MATRIX_V1.md");

  const csvLines = [MATRIX_FIELDS.join(",")];
  for (const row of rows) {
    csvLines.push(MATRIX_FIELDS.map((field) => escapeCsv(row[field])).join(","));
  }
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  const jsonlLines = rows.map((row) => JSON.stringify(row));
  fs.writeFileSync(jsonlPath, jsonlLines.length ? `${jsonlLines.join("\n")}\n` : "", "utf8");

  const counts = rows.reduce((accumulator, row) => {
    accumulator[row.classification] = (accumulator[row.classification] || 0) + 1;
    return accumulator;
  }, {});

  const mdLines = [
    "# Casework Case-Law Matrix v1",
    "",
    "*Generated artifact. Do not hand-edit; regenerate from source evidence.*",
    "",
    "Generated from `study/raw/` and review presence in `study/reviews/`.",
    "",
    "## Purpose",
    "",
    "- This matrix is cumulative analysis, not the raw evidence store.",
    "- Raw result JSON remains the evidence artifact.",
    "- Review Markdown remains interpretation.",
    "- Legal-system columns are interpretation language, not runtime reducer authority.",
    "",
    "## Current Snapshot",
    "",
    `- Row count: ${rows.length}`,
    `- Source run count: ${new Set(rows.map((row) => row.run_id)).size}`,
    `- Classification counts: ${JSON.stringify(counts)}`,
    "",
    "## Legal Mapping",
    "",
    "- `legal_verdict`: `PASS`, `PASS_WITH_REPAIR`, `HOLD`, `REPAIR`, `REANCHOR`, `REJECT`, `FAIL`.",
    "- `legal_evidence_type`: `committed_state`, `audit_log`, `visible_dom_text`, `assistant_prose_claim`, `runner_signal`, `scorer_output`.",
    "- `claim_vs_state_conflict`: true when prose/evidence suggests route survival but the scored classification claims loss or another contradiction.",
    "- `smallest_legal_reduction`: `preserve_state`, `complete_current_chunk`, `advance_one_chunk`, `ask_billy`, `repair_packet`, `no_mutation`.",
    "- `route_survival_outcome`: `survived`, `survived_with_repair`, `broken`, `unknown`.",
    "",
    "## Field Notes",
    "",
    "- Fields may be blank when the raw result never recorded that evidence.",
    "- Deterministic extraction prefers visible DOM evidence, runner diagnostics, and packet payload fields.",
    "- Manual notes belong in review Markdown and `CASEWORK_STUDY_STATUS`, not by editing generated CSV/JSONL rows directly.",
    "",
    "## Regeneration",
    "",
    "- Source evidence: `study/raw/**/*.json`",
    "- Scorer authority: `tools/command-language-casework/lib/casework-heuristics.js`",
    "- Legal authority: `tools/command-language-casework/lib/casework-legal-fields.mjs`",
    "- Generated by: `tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs` and `tools/command-language-casework/scripts/tabulate-casework-study.mjs`",
    "",
    "```bash",
    "node tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs",
    "```"
  ];

  fs.writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  return {
    rowCount: rows.length,
    csvPath,
    jsonlPath,
    mdPath
  };
}

function updateCaseworkCaseLawMatrix() {
  const rows = buildCaseLawMatrixRows();
  const outputs = writeMatrixOutputs(rows);
  return {
    rows,
    ...outputs
  };
}

function main() {
  const outputs = updateCaseworkCaseLawMatrix();
  console.log(`Case-law matrix updated: ${outputs.rowCount} rows`);
  console.log(path.relative(projectRoot, outputs.csvPath));
  console.log(path.relative(projectRoot, outputs.jsonlPath));
  console.log(path.relative(projectRoot, outputs.mdPath));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  MATRIX_FIELDS,
  buildCaseLawMatrixRows,
  updateCaseworkCaseLawMatrix
};
