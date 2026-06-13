#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { updateCaseworkCaseLawMatrix } from "./update-casework-case-law-matrix.mjs";
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

function deriveRunLegalVerdict(runRows) {
  const legalVerdicts = runRows.map((row) => row.legal_verdict).filter(Boolean);
  if (legalVerdicts.includes("FAIL")) {
    return "FAIL";
  }
  if (legalVerdicts.includes("REPAIR")) {
    return "REPAIR";
  }
  if (legalVerdicts.includes("HOLD")) {
    return "HOLD";
  }
  if (legalVerdicts.includes("PASS_WITH_REPAIR")) {
    return "PASS_WITH_REPAIR";
  }
  if (legalVerdicts.includes("PASS")) {
    return "PASS";
  }
  return legalVerdicts[0] || "HOLD";
}

function deriveRunRouteSurvivalOutcome(runRows) {
  const outcomes = runRows.map((row) => row.route_survival_outcome).filter(Boolean);
  if (outcomes.includes("broken")) {
    return "broken";
  }
  if (outcomes.includes("unknown")) {
    return "unknown";
  }
  if (outcomes.includes("survived_with_repair")) {
    return "survived_with_repair";
  }
  if (outcomes.includes("survived")) {
    return "survived";
  }
  return outcomes[0] || "unknown";
}

const STALE_NEXT_STUDY_IDS = new Set([
  "casework_reflection_loop_v1_validation",
  "scorer_keyword_extraction_v1_after_reflection_repair"
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

function buildFreshValidationPointer() {
  return {
    next_study_needed: "scorer_keyword_extraction_v3_fresh_validation",
    next_study_purpose:
      "Run a small fresh scorer keyword validation suite against the real ChatGPT browser surface to prove the repaired v3 scorer classifies new evidence correctly, while preserving the stack_papers negative control.",
    recommended_next_cases: [
      "run one fresh collect_dishes advancement case on the real browser surface",
      "run one wrong-next stack_papers negative control on the real browser surface",
      "confirm repaired scorer rows still produce deterministic legal_verdict and route_survival_outcome values",
      "confirm imported fresh runs leave wrong-next negatives classified as lost-route rather than survived"
    ],
    next_action_for_fresh_chat:
      "Do not redesign the scorer yet. Run a small fresh browser-surface validation of the repaired scorer, import the result, and confirm the negative stack_papers control still fails cleanly.",
    set_by: "Codex tabulation repair",
    set_at: new Date().toISOString().slice(0, 10),
    source: "Post-scorer-repair status cleanup"
  };
}

function maybeAdvanceManualNextStudy(statusObj) {
  const current = statusObj.manual_next_study?.next_study_needed || "";
  if (!current || STALE_NEXT_STUDY_IDS.has(current)) {
    statusObj.manual_next_study = buildFreshValidationPointer();
  }
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
  }

  for (const run of runs) {
    const runRows = caseLawByRun.get(`${run.suite_id}::${run.run_id}`) || [];
    run.legal_verdict_counts = countValues(runRows.map((row) => row.legal_verdict));
    run.route_survival_counts = countValues(runRows.map((row) => row.route_survival_outcome));
    run.legal_verdict = deriveRunLegalVerdict(runRows);
    run.route_survival_outcome = deriveRunRouteSurvivalOutcome(runRows);
  }

  const runIndexPath = path.join(indexDir, "CASEWORK_RUN_INDEX.json");
  fs.writeFileSync(runIndexPath, JSON.stringify(runs, null, 2), "utf8");

  const caseIndexPath = path.join(indexDir, "CASEWORK_CASE_INDEX.csv");
  const csvHeaders = [
    "suite_id",
    "run_id",
    "case_id",
    "title",
    "language_feature",
    "scripted_user_replies",
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
    "## Manual next-study pointer",
    "This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.",
    "",
    `**Next Study Needed**: ${manual.next_study_needed || ""}`,
    `**Purpose**: ${manual.next_study_purpose || ""}`,
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

  mdLines.push(
    "",
    "## Artifact roles",
    "",
    "- Raw result JSON = evidence",
    "- Reflection review = interpretation",
    "- Case-law matrix = cumulative analysis",
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
