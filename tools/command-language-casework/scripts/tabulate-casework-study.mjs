#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
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
  if (str == null) return "";
  const s = String(str);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function main() {
  const projectRoot = path.resolve(__dirname, "../../..");
  const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
  const studyDir = path.join(caseworkRoot, "study");
  const rawDir = path.join(studyDir, "raw");
  const indexDir = path.join(studyDir, "index");

  fs.mkdirSync(indexDir, { recursive: true });

  const rawFiles = findJsonFiles(rawDir);
  
  const runs = [];
  const casesIndex = [];

  for (const file of rawFiles) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const data = JSON.parse(content);
      
      if (!data.suite_id || !data.run_id) continue;

      const cases = Array.isArray(data.cases) ? data.cases : [];
      
      const classificationCounts = {};
      const statusCounts = {};
      let hasDomTurnTrace = false;

      for (const c of cases) {
        const cl = c.classification || "UNKNOWN";
        classificationCounts[cl] = (classificationCounts[cl] || 0) + 1;
        
        const st = c.case_status || "UNKNOWN";
        statusCounts[st] = (statusCounts[st] || 0) + 1;
        
        if (c.dom_turn_trace) hasDomTurnTrace = true;

        casesIndex.push({
          suite_id: data.suite_id,
          run_id: data.run_id,
          case_id: c.case_id || "",
          title: c.title || "",
          language_feature: c.language_feature || "",
          scripted_user_replies: (c.scripted_user_replies || []).join(" | "),
          case_status: st,
          classification: cl,
          expected_behavior_hit_count: Array.isArray(c.expected_behavior) ? c.expected_behavior.length : 0, // Simplified placeholder, actual hits require deeper parse if stored
          forbidden_behavior_hit_count: Array.isArray(c.forbidden_behavior) ? c.forbidden_behavior.length : 0, // Simplified placeholder
          observed_chunks_or_keywords: (c.observed_chunks_or_keywords || []).join(" | "),
          has_dom_turn_trace: c.dom_turn_trace ? true : false,
          raw_result_path: path.relative(caseworkRoot, file)
        });
      }

      const reviewPath = path.join(studyDir, "reviews", path.basename(path.dirname(file)), path.basename(file, ".json") + ".md");
      const reviewExists = fs.existsSync(reviewPath);

      runs.push({
        suite_id: data.suite_id,
        run_id: data.run_id,
        imported_at: data.timestamp || data.run_id, // approximation
        raw_result_path: path.relative(caseworkRoot, file),
        review_path: reviewExists ? path.relative(caseworkRoot, reviewPath) : null,
        case_count: cases.length,
        classification_counts: classificationCounts,
        status_counts: statusCounts,
        has_dom_turn_trace: hasDomTurnTrace,
        warnings_errors_count: Array.isArray(data.errors) ? data.errors.length : 0,
        suspected_tool_findings: statusCounts["TOOL_FAIL"] || 0
      });

    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
    }
  }

  // 1. Write CASEWORK_RUN_INDEX.json
  const runIndexPath = path.join(indexDir, "CASEWORK_RUN_INDEX.json");
  fs.writeFileSync(runIndexPath, JSON.stringify(runs, null, 2), "utf8");

  // 2. Write CASEWORK_CASE_INDEX.csv
  const caseIndexPath = path.join(indexDir, "CASEWORK_CASE_INDEX.csv");
  const csvHeaders = ["suite_id", "run_id", "case_id", "title", "language_feature", "scripted_user_replies", "case_status", "classification", "expected_behavior_hit_count", "forbidden_behavior_hit_count", "observed_chunks_or_keywords", "has_dom_turn_trace", "raw_result_path"];
  const csvLines = [csvHeaders.join(",")];
  for (const c of casesIndex) {
    csvLines.push(csvHeaders.map(h => escapeCsv(c[h])).join(","));
  }
  fs.writeFileSync(caseIndexPath, csvLines.join("\n"), "utf8");

  // Update Status
  const statusJsonPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.json");
  const statusMdPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.md");

  let statusObj = {};
  if (fs.existsSync(statusJsonPath)) {
    try {
      statusObj = JSON.parse(fs.readFileSync(statusJsonPath, "utf8"));
    } catch (e) {
      console.error(`Error reading status JSON: ${e.message}`);
    }
  }

  // Aggregate all classification counts across runs
  const totalClassifications = {};
  for (const r of runs) {
    for (const [k, v] of Object.entries(r.classification_counts)) {
      totalClassifications[k] = (totalClassifications[k] || 0) + v;
    }
  }

  const latestSuiteId = runs.length > 0 ? runs[runs.length - 1].suite_id : null;

  statusObj.computed_summary = {
    last_tabulated_at: new Date().toISOString(),
    run_count: runs.length,
    case_count: casesIndex.length,
    latest_suite_id: latestSuiteId,
    classification_counts: totalClassifications,
    open_findings_count: Array.isArray(statusObj.open_findings) ? statusObj.open_findings.filter(f => f.status === "open").length : 0
  };

  if (!statusObj.manual_next_study && !statusObj.computed_recommendation) {
    statusObj.computed_recommendation = {
      next_study_needed: "Needs manual review or initial seeding.",
      reason: "No manual next study specified.",
      generated_at: new Date().toISOString()
    };
  }

  fs.writeFileSync(statusJsonPath, JSON.stringify(statusObj, null, 2), "utf8");

  // Re-generate MD
  const mdLines = [
    "# Casework Study Status",
    "",
    "## Manual next-study pointer",
    "This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.",
    ""
  ];

  if (statusObj.manual_next_study) {
    const m = statusObj.manual_next_study;
    mdLines.push(`**Next Study Needed**: ${m.next_study_needed || ""}`);
    mdLines.push(`**Purpose**: ${m.next_study_purpose || ""}`);
    mdLines.push(`**Next action for fresh chat**: ${m.next_action_for_fresh_chat || ""}`);
    mdLines.push(`**Source**: ${m.source || ""}`);
    mdLines.push(`**Set by**: ${m.set_by || ""}`);
    mdLines.push(`**Set at**: ${m.set_at || ""}`);
    
    if (Array.isArray(m.recommended_next_cases) && m.recommended_next_cases.length > 0) {
      mdLines.push("");
      mdLines.push("### Recommended Next Cases");
      for (const rec of m.recommended_next_cases) {
        mdLines.push(`- ${rec}`);
      }
    }
  } else {
    mdLines.push("*(No manual next study provided)*");
  }

  mdLines.push("");
  mdLines.push("## Computed summary");
  mdLines.push("Generated from raw result files.");
  mdLines.push("");
  mdLines.push(`- Last tabulated at: ${statusObj.computed_summary.last_tabulated_at}`);
  mdLines.push(`- Run count: ${statusObj.computed_summary.run_count}`);
  mdLines.push(`- Case count: ${statusObj.computed_summary.case_count}`);
  mdLines.push(`- Latest suite ID: ${statusObj.computed_summary.latest_suite_id || "null"}`);
  mdLines.push(`- Classification counts: ${JSON.stringify(statusObj.computed_summary.classification_counts)}`);
  mdLines.push(`- Open findings count: ${statusObj.computed_summary.open_findings_count}`);
  
  mdLines.push("");
  mdLines.push("## Open findings");
  mdLines.push("Generated and/or manually curated.");
  mdLines.push("");

  if (Array.isArray(statusObj.open_findings) && statusObj.open_findings.length > 0) {
    for (const f of statusObj.open_findings) {
      mdLines.push(`- **${f.finding_id}** (${f.status}): ${f.summary} Recommended next study: ${f.recommended_next_study || "none"}`);
    }
  } else {
    mdLines.push("*(No open findings)*");
  }

  fs.writeFileSync(statusMdPath, mdLines.join("\n"), "utf8");

  // Keep existing language map intact if exists, otherwise generate basic.
  const languageMapPath = path.join(indexDir, "CASEWORK_LANGUAGE_MAP.md");
  if (!fs.existsSync(languageMapPath)) {
    fs.writeFileSync(languageMapPath, "# Casework Language Map\n\n*This file is generated automatically by tabulate-casework-study.mjs.*\n\n## done_vs_move_on\n- Initial finding: done holds the active chunk boundary; move_on advances exactly one chunk to collect_dishes.\n", "utf8");
  }

  // Same for open findings map
  const openFindingsPath = path.join(indexDir, "CASEWORK_OPEN_FINDINGS.md");
  if (!fs.existsSync(openFindingsPath)) {
    fs.writeFileSync(openFindingsPath, "# Casework Open Findings\n\n*This file is generated automatically by tabulate-casework-study.mjs.*\n", "utf8");
  }

  console.log("Tabulation complete.");
}

main();
