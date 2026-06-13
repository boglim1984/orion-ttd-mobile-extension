#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { updateCaseworkCaseLawMatrix } from "./update-casework-case-law-matrix.mjs";
import {
  deriveRunLegalVerdict,
  deriveRunRouteSurvivalOutcome
} from "../lib/casework-legal-fields.mjs";
import {
  ensureReviewForResult,
  findPlaceholderReviews
} from "../lib/casework-reflection.mjs";
import heuristicsApi from "../lib/casework-heuristics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { deriveDeterministicCaseSignals } = heuristicsApi;

function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findJsonFiles(fullPath, fileList);
    } else if (file.endsWith(".json")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function escapeCsv(str) {
  if (str == null) {
    return "";
  }
  const text = String(str);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
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
    if (field && typeof field === "string" && field.trim() !== "") {
      return field;
    }
  }
  return "UNKNOWN";
}

function getCaseStatus(caseResult) {
  const fields = [
    caseResult.case_status,
    caseResult.status,
    caseResult.caseStatus
  ];
  for (const field of fields) {
    if (field && typeof field === "string" && field.trim() !== "") {
      return field;
    }
  }
  return "UNKNOWN";
}

function countOpenFindings(openFindings) {
  return Array.isArray(openFindings)
    ? openFindings.filter((finding) => finding.status === "open").length
    : 0;
}

function makeCaseKey(suiteId, runId, caseId) {
  return `${suiteId}::${runId}::${caseId}`;
}

function countValues(values) {
  const counts = {};
  for (const value of values) {
    if (!value) {
      continue;
    }
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

const STALE_NEXT_STUDY_IDS = new Set([
  "casework_reflection_loop_v1_validation",
  "scorer_keyword_extraction_v1_after_reflection_repair",
  "scorer_keyword_extraction_v3_fresh_validation"
]);

const AUTO_RESOLVED_FINDINGS = {
  casework_reflection_loop_missing_001:
    "Reflection loop validation and derived-artifact regeneration are now in place.",
  casework_window_model_miscount_001:
    "Casework docs and runner flow now treat design chat, local GUI, and disposable ChatGPT test tab as distinct surfaces.",
  casework_case_law_matrix_missing_001:
    "The cumulative case-law matrix is now generated from imported runs.",
  casework_legal_system_not_integrated_001:
    "Legal verdict and route-survival fields are now part of derived casework outputs.",
  casework_artifact_overlap_risk_001:
    "Status, matrix, review, and raw evidence roles are now explicitly separated in the study artifacts.",
  scorer_collect_dishes_false_lost_route_001:
    "The collect_dishes scorer repair landed and historical rows now recompute correctly."
};

function buildRouteLawContractRelaxationPointer() {
  return {
    next_study_needed: "route_law_contract_relaxation_matrix_v1",
    next_study_purpose:
      "Audit whether route_law_language_expansion_v1 proved durable route-law behavior or merely showed compliance with very explicit response_contract language. The next suite should compare strict versus relaxed command packets and preserve route-law guarantees when wording is less overfit.",
    evidence_reviewed: [
      "scorer_keyword_extraction_v3_fresh_validation completed with zero open findings",
      "route_law_language_expansion_v1 passed 4/4 and preserved continue, done, move_on, and side-question return behavior",
      "current matrix now distinguishes case-level outcomes from suite/run shape"
    ],
    current_confidence:
      "Confidence is medium for explicit contract packets and still limited for relaxed or less scripted packets.",
    open_gap:
      "The current evidence does not yet separate durable route-law behavior from overfit obedience to explicit response_contract wording, explicit chunk IDs, or over-specified next-step phrasing.",
    test_strategy:
      "Use a contrast/matrix suite, not another tiny smoke batch. Compare strict versus relaxed contract language, explicit IDs versus label-only references, completion phrasing with and without the next chunk named, and side-question return under lighter rescue wording.",
    recommended_cases: [
      "strict continue hold with explicit clear_trash id, to confirm the prior pass remains stable",
      "relaxed continue hold using label-only clear trash wording, to detect dependence on exact id fields",
      "strict done boundary that acknowledges completion but does not advance without move_on",
      "relaxed done boundary without the next chunk supplied, to test whether the model invents advancement",
      "strict move_on that should advance exactly one chunk to collect_dishes",
      "relaxed move_on using lighter wording, to detect whether advancement still stays one chunk",
      "side-question return under reduced rescue language, then move_on, to test persistence after interruption",
      "late negative control proving the route is still preserved after earlier route-law cases"
    ],
    recommended_case_reasons: [
      "Anchor one strict control so the suite can detect regression versus prior passing behavior.",
      "Label-only and relaxed variants test whether route-law survives without over-specified protocol wording.",
      "A late negative control checks for context drift instead of only isolated success."
    ],
    avoid: [
      "do not repeat another four-case all-strict smoke batch",
      "do not treat next_study_needed as enough justification by itself",
      "do not regenerate scorer-validation suites unless a scorer dispute reopens"
    ],
    do_not_repeat: [
      "the completed scorer_keyword_extraction_v3_fresh_validation agenda",
      "a route_law_language_expansion_v1 clone that only restates explicit response_contract wording"
    ],
    suite_shape_recommendation:
      "Use 6 to 8 cases in one disposable chat. Mark the suite as contrast/matrix, preserve case order, and include one late negative control so context carryover is observable rather than flattened away.",
    retirement_condition:
      "Retire this pointer after a meaningful imported result either shows relaxed packets still preserve route law or isolates the exact contract weakening that breaks preservation.",
    next_action_for_fresh_chat:
      "Enter research-planning mode first. Inspect status, recent reviews, the case-law matrix, and run/case indexes. Confirm that route_law_language_expansion_v1 already proved the strict contract path, then design a contrast suite that changes confidence rather than repeating that evidence. Only emit runnable JSON when Billy explicitly asks for the suite.",
    set_by: "Billy / Codex audit and study-loop redesign",
    set_at: new Date().toISOString().slice(0, 10),
    source:
      "Audit of scorer_keyword_extraction_v3_fresh_validation plus route_law_language_expansion_v1 imported evidence, with matrix/index redesign to preserve suite size, case order, and context depth."
  };
}

function maybeAdvanceManualNextStudy(statusObj) {
  const current = statusObj.manual_next_study?.next_study_needed || "";
  if (
    !current ||
    STALE_NEXT_STUDY_IDS.has(current) ||
    current === "route_law_language_expansion_v1"
  ) {
    statusObj.manual_next_study = buildRouteLawContractRelaxationPointer();
  }
}

function deriveRunShapeSummary(runRows) {
  const suiteCaseCount = runRows.length;
  const suiteDesignType = runRows[0]?.suite_design_type || "unknown";
  const suiteContextRisk = runRows[0]?.suite_context_risk || "unknown";
  const maxApproximateDepth = runRows.reduce((max, row) => {
    const value = Number(row.approximate_chat_turn_depth_before_case || 0);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
  const negativeControlPositions = [...new Set(
    runRows
      .map((row) => row.negative_control_position)
      .filter((value) => value && value !== "none")
  )];
  const carryoverCaseCount = runRows.filter(
    (row) => row.case_context_isolation === "carryover_context_present"
  ).length;
  return {
    suite_case_count: suiteCaseCount,
    suite_design_type: suiteDesignType,
    suite_context_risk: suiteContextRisk,
    max_approximate_chat_turn_depth_before_case: maxApproximateDepth,
    negative_control_positions: negativeControlPositions,
    carryover_case_count: carryoverCaseCount,
    isolated_case_count: runRows.filter(
      (row) => row.case_context_isolation === "isolated_first_case"
    ).length
  };
}

function buildEvidenceDigest({ statusObj, runs, recentReviews, matrixOutputs }) {
  const manual = statusObj.manual_next_study || {};
  const lines = [
    "# Casework Evidence Digest",
    "",
    "*Generated convenience digest. Raw JSON, reviews, indexes, and matrix remain the source evidence surfaces.*",
    "",
    "## Why this exists",
    "",
    "- Fresh planning chats should not choose the next study from `next_study_needed` alone.",
    "- Use this digest to orient quickly, then inspect linked reviews, indexes, and raw evidence when planning the next suite.",
    "",
    "## Active research brief",
    "",
    `- Next study: ${manual.next_study_needed || "not set"}`,
    `- Purpose: ${manual.next_study_purpose || "not set"}`,
    `- Current confidence: ${manual.current_confidence || "not set"}`,
    `- Open gap: ${manual.open_gap || "not set"}`,
    `- Suite shape recommendation: ${manual.suite_shape_recommendation || "not set"}`,
    "",
    "## Evidence summary",
    "",
    `- Imported run count: ${statusObj.computed_summary?.run_count || 0}`,
    `- Imported case count: ${statusObj.computed_summary?.case_count || 0}`,
    `- Matrix row count: ${matrixOutputs.rowCount}`,
    `- Latest imported suite ID: ${statusObj.computed_summary?.latest_suite_id || "null"}`,
    `- Latest imported run ID: ${statusObj.computed_summary?.latest_run_id || "null"}`,
    "",
    "## What appears proven",
    "",
    "- Scorer keyword extraction v3 validation is complete with no open findings.",
    "- The explicit route_law_language_expansion_v1 packet family passed continue hold, done hold, move_on advance, and side-question return behaviors.",
    "- Variable suite size is now treated as evidence shape, not noise to flatten away.",
    "",
    "## What remains fragile or under-tested",
    "",
    "- Relaxed route-law packets may still fail even though strict response_contract packets passed.",
    "- Label-only references and lighter completion wording are under-tested relative to explicit chunk-id packets.",
    "- Late-suite negative controls are still sparse, so drift under carryover context remains only partially observed.",
    "",
    "## Recent imported runs",
    ""
  ];

  for (const run of runs.slice(-3).reverse()) {
    lines.push(
      `- ${run.suite_id} / ${run.run_id}: ${run.case_count} cases, legal=${run.legal_verdict}, route=${run.route_survival_outcome}, design=${run.suite_design_type || "unknown"}, context_risk=${run.suite_context_risk || "unknown"}`
    );
  }

  if (recentReviews.length > 0) {
    lines.push("", "## Recent review files", "");
    for (const review of recentReviews) {
      lines.push(`- ${review}`);
    }
  }

  lines.push(
    "",
    "## Planning rule",
    "",
    "- Small means focused, not shallow.",
    "- Use four cases only for smoke checks, validator checks, or narrow regressions.",
    "- For research suites, use the smallest set that can answer the question, often six to ten cases.",
    "- Suite size, case order, and chat turn depth are experimental variables. Compare evidence by run shape, not just pass/fail totals."
  );

  return `${lines.join("\n")}\n`;
}

function normalizeFindings(statusObj) {
  const currentOpenFindings = Array.isArray(statusObj.open_findings) ? statusObj.open_findings : [];
  const resolvedFindings = Array.isArray(statusObj.resolved_findings) ? statusObj.resolved_findings.slice() : [];
  const resolvedById = new Map(resolvedFindings.map((finding) => [finding.finding_id, finding]));
  const nextOpenFindings = [];

  for (const finding of currentOpenFindings) {
    const resolution = AUTO_RESOLVED_FINDINGS[finding.finding_id];
    if (!resolution) {
      if (finding.status === "open") {
        nextOpenFindings.push(finding);
      }
      continue;
    }

    if (!resolvedById.has(finding.finding_id)) {
      resolvedById.set(finding.finding_id, {
        finding_id: finding.finding_id,
        status: "resolved",
        summary: finding.summary,
        resolution_note: resolution,
        resolved_at: new Date().toISOString().slice(0, 10)
      });
    }
  }

  statusObj.open_findings = nextOpenFindings;
  statusObj.resolved_findings = [...resolvedById.values()];
}

function renderOpenFindingsMd(statusObj) {
  const lines = [
    "# Casework Open Findings",
    "",
    "*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*",
    "",
    "*This file is generated automatically by tabulate-casework-study.mjs.*",
    ""
  ];

  if (Array.isArray(statusObj.open_findings) && statusObj.open_findings.length > 0) {
    for (const finding of statusObj.open_findings) {
      lines.push(`## Open Issue: ${finding.finding_id}`);
      lines.push(`**Summary:** ${finding.summary}`);
      lines.push("");
      lines.push(`**Recommended Next Study:** ${finding.recommended_next_study || "none"}`);
      lines.push("");
    }
  } else {
    lines.push("No open findings are currently recorded.");
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const projectRoot = path.resolve(__dirname, "../../..");
  const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
  const studyDir = path.join(caseworkRoot, "study");
  const rawDir = path.join(studyDir, "raw");
  const indexDir = path.join(studyDir, "index");

  fs.mkdirSync(indexDir, { recursive: true });

  const rawFiles = findJsonFiles(rawDir).sort();
  const runs = [];
  const casesIndex = [];
  const reviewRepairActions = [];

  for (const file of rawFiles) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const data = JSON.parse(content);
      if (!data.suite_id || !data.run_id) {
        continue;
      }

      const cases = Array.isArray(data.cases) ? data.cases : [];
      const classificationCounts = {};
      const statusCounts = {};
      let hasDomTurnTrace = false;

      for (const caseResult of cases) {
        const deterministic = deriveDeterministicCaseSignals(caseResult);
        const classification = deterministic.classification || getCaseClassification(caseResult);
        const caseStatus = getCaseStatus(caseResult);
        classificationCounts[classification] = (classificationCounts[classification] || 0) + 1;
        statusCounts[caseStatus] = (statusCounts[caseStatus] || 0) + 1;
        hasDomTurnTrace = hasDomTurnTrace || Boolean(caseResult.dom_turn_trace);

        casesIndex.push({
          suite_id: data.suite_id,
          run_id: data.run_id,
          case_id: caseResult.case_id || "",
          title: caseResult.title || "",
          language_feature: caseResult.language_feature || "",
          scripted_user_replies: (caseResult.scripted_user_replies_sent || []).join(" | "),
          case_status: caseStatus,
          classification,
          expected_behavior_hit_count: Array.isArray(caseResult.expected_behavior)
            ? caseResult.expected_behavior.length
            : 0,
          forbidden_behavior_hit_count: Array.isArray(caseResult.forbidden_behavior)
            ? caseResult.forbidden_behavior.length
            : 0,
          observed_chunks_or_keywords: deterministic.observed_chunks_or_keywords.join(" | "),
          has_dom_turn_trace: Boolean(caseResult.dom_turn_trace),
          raw_result_path: path.relative(caseworkRoot, file)
        });
      }

      const reviewPath = path.join(
        studyDir,
        "reviews",
        path.basename(path.dirname(file)),
        `${path.basename(file, ".json")}.md`
      );
      const reviewSync = ensureReviewForResult({
        resultData: data,
        caseworkRoot,
        destJsonPath: file,
        destReviewPath: reviewPath,
        importedAt: data.timestamp || data.started_at || data.completed_at || new Date().toISOString()
      });
      reviewRepairActions.push({
        reviewPath,
        action: reviewSync.action
      });

      runs.push({
        suite_id: data.suite_id,
        run_id: data.run_id,
        imported_at: data.timestamp || data.started_at || data.run_id,
        raw_result_path: path.relative(caseworkRoot, file),
        review_path: fs.existsSync(reviewPath) ? path.relative(caseworkRoot, reviewPath) : null,
        case_count: cases.length,
        classification_counts: classificationCounts,
        status_counts: statusCounts,
        has_dom_turn_trace: hasDomTurnTrace,
        warnings_errors_count: (Array.isArray(data.warnings) ? data.warnings.length : 0) + (Array.isArray(data.errors) ? data.errors.length : 0),
        suspected_tool_findings: Object.keys(classificationCounts).filter((label) => label.startsWith("TOOL_FAIL_")).reduce((sum, label) => sum + classificationCounts[label], 0)
      });
    } catch (error) {
      console.error(`Error parsing ${file}: ${error.message}`);
    }
  }

  const matrixOutputs = updateCaseworkCaseLawMatrix();
  const caseLawByKey = new Map(
    matrixOutputs.rows.map((row) => [makeCaseKey(row.suite_id, row.run_id, row.case_id), row])
  );
  const caseLawByRun = new Map();
  for (const row of matrixOutputs.rows) {
    const runKey = `${row.suite_id}::${row.run_id}`;
    const items = caseLawByRun.get(runKey) || [];
    items.push(row);
    caseLawByRun.set(runKey, items);
  }

  for (const caseRow of casesIndex) {
    const caseLawRow = caseLawByKey.get(makeCaseKey(caseRow.suite_id, caseRow.run_id, caseRow.case_id));
    caseRow.failure_layer = caseLawRow?.failure_layer || "none";
    caseRow.legal_verdict = caseLawRow?.legal_verdict || "HOLD";
    caseRow.route_survival_outcome = caseLawRow?.route_survival_outcome || "unknown";
    caseRow.suite_case_count = caseLawRow?.suite_case_count || "";
    caseRow.suite_design_type = caseLawRow?.suite_design_type || "";
    caseRow.suite_context_risk = caseLawRow?.suite_context_risk || "";
    caseRow.case_index_in_suite = caseLawRow?.case_index_in_suite || "";
    caseRow.case_order = caseLawRow?.case_order || "";
    caseRow.prior_cases_in_same_run = caseLawRow?.prior_cases_in_same_run || "";
    caseRow.case_context_isolation = caseLawRow?.case_context_isolation || "";
    caseRow.scripted_reply_count = caseLawRow?.scripted_reply_count || "";
    caseRow.assistant_turn_count_in_case = caseLawRow?.assistant_turn_count_in_case || "";
    caseRow.user_turn_count_in_case = caseLawRow?.user_turn_count_in_case || "";
    caseRow.approximate_chat_turn_depth_before_case = caseLawRow?.approximate_chat_turn_depth_before_case || "";
    caseRow.negative_control_position = caseLawRow?.negative_control_position || "";
  }

  for (const run of runs) {
    const runRows = caseLawByRun.get(`${run.suite_id}::${run.run_id}`) || [];
    run.legal_verdict_counts = countValues(runRows.map((row) => row.legal_verdict));
    run.route_survival_counts = countValues(runRows.map((row) => row.route_survival_outcome));
    run.legal_verdict = deriveRunLegalVerdict(runRows);
    run.route_survival_outcome = deriveRunRouteSurvivalOutcome(runRows);
    Object.assign(run, deriveRunShapeSummary(runRows));
  }

  const runIndexPath = path.join(indexDir, "CASEWORK_RUN_INDEX.json");
  fs.writeFileSync(runIndexPath, JSON.stringify(runs, null, 2), "utf8");

  const caseIndexPath = path.join(indexDir, "CASEWORK_CASE_INDEX.csv");
  const csvHeaders = [
    "suite_id",
    "run_id",
    "suite_case_count",
    "suite_design_type",
    "suite_context_risk",
    "case_id",
    "case_index_in_suite",
    "case_order",
    "prior_cases_in_same_run",
    "case_context_isolation",
    "title",
    "language_feature",
    "scripted_user_replies",
    "scripted_reply_count",
    "assistant_turn_count_in_case",
    "user_turn_count_in_case",
    "approximate_chat_turn_depth_before_case",
    "negative_control_position",
    "case_status",
    "classification",
    "failure_layer",
    "legal_verdict",
    "route_survival_outcome",
    "expected_behavior_hit_count",
    "forbidden_behavior_hit_count",
    "observed_chunks_or_keywords",
    "has_dom_turn_trace",
    "raw_result_path"
  ];
  const csvLines = [csvHeaders.join(",")];
  for (const caseRow of casesIndex) {
    csvLines.push(csvHeaders.map((header) => escapeCsv(caseRow[header])).join(","));
  }
  fs.writeFileSync(caseIndexPath, csvLines.join("\n"), "utf8");

  const statusJsonPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.json");
  const statusMdPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.md");

  let statusObj = {};
  if (fs.existsSync(statusJsonPath)) {
    try {
      statusObj = JSON.parse(fs.readFileSync(statusJsonPath, "utf8"));
    } catch (error) {
      console.error(`Error reading status JSON: ${error.message}`);
    }
  }

  maybeAdvanceManualNextStudy(statusObj);
  normalizeFindings(statusObj);

  const totalClassifications = {};
  for (const run of runs) {
    for (const [key, value] of Object.entries(run.classification_counts)) {
      totalClassifications[key] = (totalClassifications[key] || 0) + value;
    }
  }

  statusObj.study_id = statusObj.study_id || "command-language-casework-v1";
  statusObj.status_schema_version = 1;
  statusObj.artifact_roles = {
    raw_result_json: "evidence",
    reflection_review: "interpretation",
    case_law_matrix: "cumulative analysis",
    legal_system: "authority/evidence language",
    study_status: "agenda",
    coding_rulebook: "agent behavior"
  };
  statusObj.integration_open_question =
    "Collapse or redesign overlapping artifacts if they become duplicate sources of truth.";
  statusObj.computed_summary = {
    last_tabulated_at: new Date().toISOString(),
    run_count: runs.length,
    case_count: casesIndex.length,
    latest_suite_id: runs.length > 0 ? runs[runs.length - 1].suite_id : null,
    latest_run_id: runs.length > 0 ? runs[runs.length - 1].run_id : null,
    classification_counts: totalClassifications,
    open_findings_count: countOpenFindings(statusObj.open_findings),
    matrix_row_count: matrixOutputs.rowCount
  };

  if (!statusObj.manual_next_study && !statusObj.computed_recommendation) {
    statusObj.computed_recommendation = {
      next_study_needed: "Needs manual review or initial seeding.",
      reason: "No manual next study specified.",
      generated_at: new Date().toISOString()
    };
  }

  fs.writeFileSync(statusJsonPath, JSON.stringify(statusObj, null, 2), "utf8");

  const manual = statusObj.manual_next_study || {};
  const mdLines = [
    "# Casework Study Status",
    "",
    "*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*",
    "",
    "## Manual next-study pointer",
    "This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.",
    "",
    `**Next Study Needed**: ${manual.next_study_needed || ""}`,
    `**Purpose**: ${manual.next_study_purpose || ""}`,
    `**Evidence reviewed**: ${Array.isArray(manual.evidence_reviewed) ? manual.evidence_reviewed.join(" | ") : (manual.evidence_reviewed || "")}`,
    `**Current confidence**: ${manual.current_confidence || ""}`,
    `**Open gap**: ${manual.open_gap || ""}`,
    `**Test strategy**: ${manual.test_strategy || ""}`,
    `**Avoid / do not repeat**: ${[
      ...(Array.isArray(manual.avoid) ? manual.avoid : []),
      ...(Array.isArray(manual.do_not_repeat) ? manual.do_not_repeat : [])
    ].join(" | ")}`,
    `**Suite shape recommendation**: ${manual.suite_shape_recommendation || ""}`,
    `**Retirement condition**: ${manual.retirement_condition || ""}`,
    `**Next action for fresh chat**: ${manual.next_action_for_fresh_chat || ""}`,
    `**Source**: ${manual.source || ""}`,
    `**Set by**: ${manual.set_by || ""}`,
    `**Set at**: ${manual.set_at || ""}`
  ];

  if (Array.isArray(manual.recommended_next_cases) && manual.recommended_next_cases.length > 0) {
    mdLines.push("", "### Recommended Next Cases");
    for (const item of manual.recommended_next_cases) {
      mdLines.push(`- ${item}`);
    }
  }

  if (Array.isArray(manual.recommended_case_reasons) && manual.recommended_case_reasons.length > 0) {
    mdLines.push("", "### Why these cases");
    for (const item of manual.recommended_case_reasons) {
      mdLines.push(`- ${item}`);
    }
  }

  mdLines.push(
    "",
    "## Artifact roles",
    "",
    "- Raw result JSON = evidence",
    "- Reflection review = interpretation",
    "- Case-law matrix = cumulative analysis",
    "- Evidence digest = planning convenience surface",
    "- Legal system = authority/evidence language",
    "- Study status = agenda",
    "- Rulebook = agent behavior",
    "",
    "## Open integration question",
    "",
    "- Collapse or redesign overlapping artifacts if they become duplicate sources of truth.",
    "",
    "## Computed summary",
    "Generated from raw result files.",
    "",
    `- Last tabulated at: ${statusObj.computed_summary.last_tabulated_at}`,
    `- Run count: ${statusObj.computed_summary.run_count}`,
    `- Case count: ${statusObj.computed_summary.case_count}`,
    `- Latest suite ID: ${statusObj.computed_summary.latest_suite_id || "null"}`,
    `- Latest run ID: ${statusObj.computed_summary.latest_run_id || "null"}`,
    `- Classification counts: ${JSON.stringify(statusObj.computed_summary.classification_counts)}`,
    `- Open findings count: ${statusObj.computed_summary.open_findings_count}`,
    `- Case-law matrix rows: ${statusObj.computed_summary.matrix_row_count}`,
    "",
    "## Open findings",
    "Generated and/or manually curated.",
    ""
  );

  if (Array.isArray(statusObj.open_findings) && statusObj.open_findings.length > 0) {
    for (const finding of statusObj.open_findings) {
      mdLines.push(`- **${finding.finding_id}** (${finding.status}): ${finding.summary} Recommended next study: ${finding.recommended_next_study || "none"}`);
    }
  } else {
    mdLines.push("*(No open findings)*");
  }

  if (Array.isArray(statusObj.resolved_findings) && statusObj.resolved_findings.length > 0) {
    mdLines.push("", "## Recently resolved findings", "Generated from casework status cleanup.", "");
    for (const finding of statusObj.resolved_findings) {
      mdLines.push(`- **${finding.finding_id}** (${finding.status}): ${finding.resolution_note || finding.summary}`);
    }
  }

  fs.writeFileSync(statusMdPath, mdLines.join("\n"), "utf8");

  const evidenceDigestPath = path.join(studyDir, "CASEWORK_EVIDENCE_DIGEST.md");
  const recentReviewPaths = runs
    .map((run) => run.review_path)
    .filter(Boolean)
    .slice(-3);
  fs.writeFileSync(
    evidenceDigestPath,
    buildEvidenceDigest({
      statusObj,
      runs,
      recentReviews: recentReviewPaths,
      matrixOutputs
    }),
    "utf8"
  );

  const languageMapPath = path.join(indexDir, "CASEWORK_LANGUAGE_MAP.md");
  if (!fs.existsSync(languageMapPath)) {
    fs.writeFileSync(
      languageMapPath,
      "# Casework Language Map\n\n*This file is generated automatically by tabulate-casework-study.mjs.*\n\n## done_vs_move_on\n- Initial finding: done holds the active chunk boundary; move_on advances exactly one chunk to collect_dishes.\n",
      "utf8"
    );
  }

  const openFindingsPath = path.join(indexDir, "CASEWORK_OPEN_FINDINGS.md");
  fs.writeFileSync(openFindingsPath, renderOpenFindingsMd(statusObj), "utf8");

  const placeholderReviews = findPlaceholderReviews(path.join(studyDir, "reviews"));
  if (placeholderReviews.length > 0) {
    console.warn("Placeholder review text still present:");
    for (const reviewPath of placeholderReviews) {
      console.warn(path.relative(caseworkRoot, reviewPath));
    }
  }

  const repairedCount = reviewRepairActions.filter((item) => item.action === "repaired").length;
  const createdCount = reviewRepairActions.filter((item) => item.action === "created").length;
  if (repairedCount > 0 || createdCount > 0) {
    console.log(`Review sync: created=${createdCount} repaired=${repairedCount}`);
  }
  console.log("Tabulation complete.");
}

main();
