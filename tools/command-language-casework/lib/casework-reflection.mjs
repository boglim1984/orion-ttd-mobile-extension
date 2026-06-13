import fs from "node:fs";
import path from "node:path";

const REVIEW_PLACEHOLDER_PATTERNS = [
  /\*\(Add notes on the most important pass(?:, the most important failure, and whether the result is usable evidence\.)?\*\)/i,
  /\*\(What should the next suite test\?\)\*/i,
  /\*\(Only propose the next suite after matrix\/status\/legal interpretation are updated\.\)\*/i
];

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getCaseClassification(caseResult) {
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

function summarizeClassifications(cases) {
  const counts = {};
  for (const caseResult of cases) {
    const classification = getCaseClassification(caseResult);
    counts[classification] = (counts[classification] || 0) + 1;
  }
  return counts;
}

function summarizeByPrefix(classificationCounts) {
  const summary = {
    passCount: 0,
    failCount: 0,
    holdCount: 0,
    toolFailCount: 0,
    unknownCount: 0
  };

  for (const [label, count] of Object.entries(classificationCounts)) {
    if (label.startsWith("TOOL_FAIL_")) {
      summary.toolFailCount += count;
    } else if (label.startsWith("PASS")) {
      summary.passCount += count;
    } else if (label.startsWith("FAIL")) {
      summary.failCount += count;
    } else if (label.startsWith("HOLD")) {
      summary.holdCount += count;
    } else {
      summary.unknownCount += count;
    }
  }

  return summary;
}

function pickCase(cases, predicate) {
  return cases.find(predicate) || null;
}

function formatCaseBullet(caseResult, fallbackText) {
  if (!caseResult) {
    return fallbackText;
  }
  const classification = getCaseClassification(caseResult);
  const label = cleanText(caseResult.title || caseResult.case_id || "unnamed case");
  return `${label} (${classification})`;
}

function deriveEvidenceUsability(prefixSummary, caseCount) {
  if (!caseCount) {
    return "No cases were recorded, so there is no usable evidence yet.";
  }
  if (prefixSummary.toolFailCount === caseCount) {
    return "All recorded cases were blocked by tooling, so this run is not usable for route-law judgment.";
  }
  if (prefixSummary.failCount > 0 && prefixSummary.passCount > 0) {
    return "This run is usable evidence because it contains both successful and disputed/failing boundaries.";
  }
  if (prefixSummary.failCount > 0) {
    return "This run is usable evidence because it records route-law failure or scorer-dispute behavior.";
  }
  if (prefixSummary.passCount > 0) {
    return "This run is usable evidence because it records route-law survival behavior.";
  }
  return "This run captured evidence, but the result still needs human review to classify its legal weight.";
}

function deriveLayerSummary(prefixSummary) {
  if (prefixSummary.toolFailCount > 0 && prefixSummary.passCount === 0 && prefixSummary.failCount === 0) {
    return {
      tool: "Primary issue: tooling/runner evidence is incomplete or invalid.",
      scorer: "No strong scorer dispute is established from this run alone.",
      language: "Language-route judgment is blocked by the tool outcome.",
      transport: "Check send/observe plumbing before trusting route conclusions."
    };
  }

  return {
    tool: prefixSummary.toolFailCount > 0
      ? `Tool failures were present in ${prefixSummary.toolFailCount} case(s), but they did not dominate the whole run.`
      : "No dominant tool failure pattern was recorded in this run.",
    scorer: prefixSummary.failCount > 0 && prefixSummary.passCount > 0
      ? "Mixed pass/fail evidence suggests at least one scorer or interpretation boundary is disputed."
      : "No obvious scorer dispute dominates beyond the recorded classifications.",
    language: prefixSummary.failCount > 0
      ? `Route-law failure labels appeared in ${prefixSummary.failCount} case(s).`
      : "No route-law failure dominated the generated classifications.",
    transport: prefixSummary.toolFailCount > 0
      ? "Transport/setup should stay under review where tool-failure labels appear."
      : "Transport was not the dominant issue in this run."
  };
}

function deriveNextStudyImplication(prefixSummary) {
  if (prefixSummary.toolFailCount > 0 && prefixSummary.passCount === 0 && prefixSummary.failCount === 0) {
    return "Keep the manual next-study pointer unchanged. Repair the tool path and rerun reflection before designing new language/scorer suites.";
  }
  if (prefixSummary.failCount > 0 && prefixSummary.passCount > 0) {
    return "Keep the manual next-study pointer unchanged until the reflection loop and legal matrix settle the pass/fail dispute.";
  }
  if (prefixSummary.failCount > 0) {
    return "Keep the manual next-study pointer unchanged and treat this run as failure evidence for the reflection loop.";
  }
  if (prefixSummary.passCount > 0) {
    return "Keep the manual next-study pointer unchanged unless the reviewed matrix shows a stronger next-study need.";
  }
  return "Do not change the manual next-study pointer until reflection, matrix, and legal interpretation are complete.";
}

function buildMermaidLines(resultData, prefixSummary) {
  return [
    "```mermaid",
    "flowchart TD",
    `  A[\"Run ${cleanText(resultData.run_id)}\"] --> B[\"Pass cases: ${prefixSummary.passCount}\"]`,
    `  A --> C[\"Fail cases: ${prefixSummary.failCount}\"]`,
    `  A --> D[\"Tool failures: ${prefixSummary.toolFailCount}\"]`,
    "  B --> E[\"Preserve usable route-law evidence\"]",
    "  C --> F[\"Classify failure layer and legal verdict\"]",
    "  D --> G[\"Repair tooling before trusting route judgment\"]",
    "  E --> H[\"Update matrix and keep manual next-study pointer under review\"]",
    "  F --> H",
    "  G --> H",
    "```"
  ];
}

function reviewHasPlaceholder(text) {
  return REVIEW_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(String(text || "")));
}

function buildReviewContent({ resultData, caseworkRoot, destJsonPath, destReviewPath, importedAt }) {
  const cases = Array.isArray(resultData.cases) ? resultData.cases : [];
  const caseCount = cases.length;
  const classificationCounts = summarizeClassifications(cases);
  const prefixSummary = summarizeByPrefix(classificationCounts);
  const importantPassCase = pickCase(cases, (caseResult) => getCaseClassification(caseResult).startsWith("PASS"));
  const importantFailureCase =
    pickCase(cases, (caseResult) => getCaseClassification(caseResult).startsWith("FAIL")) ||
    pickCase(cases, (caseResult) => getCaseClassification(caseResult).startsWith("TOOL_FAIL_")) ||
    pickCase(cases, (caseResult) => getCaseClassification(caseResult).startsWith("HOLD"));
  const layerSummary = deriveLayerSummary(prefixSummary);
  const rawPath = path.relative(caseworkRoot, destJsonPath);
  const reviewPath = path.relative(caseworkRoot, destReviewPath);

  const summaryLines = Object.entries(classificationCounts).map(([classification, count]) => `- **${classification}**: ${count}`);
  const mermaidLines = buildMermaidLines(resultData, prefixSummary);

  return [
    `# Casework Review: ${resultData.suite_id}`,
    "",
    `- **Run ID**: \`${resultData.run_id}\``,
    `- **Imported At**: ${importedAt}`,
    `- **Raw Result JSON**: \`${rawPath}\``,
    `- **Case Count**: ${caseCount}`,
    "",
    "## Reflection Checklist",
    "- [x] Mermaid-first review generated",
    `- [x] Most important pass identified: ${formatCaseBullet(importantPassCase, "no pass case recorded")}`,
    `- [x] Most important failure identified: ${formatCaseBullet(importantFailureCase, "no failure case recorded")}`,
    "- [x] Tool vs scorer vs language vs transport layer summarized deterministically",
    `- [x] Evidence usability noted: ${deriveEvidenceUsability(prefixSummary, caseCount)}`,
    "- [x] Study status change remains gated by reflection and matrix review",
    "- [ ] Human review may still refine the generated interpretation",
    "",
    "## Mermaid-first Review",
    ...mermaidLines,
    "",
    "## Classification Summary",
    ...(summaryLines.length ? summaryLines : ["- None"]),
    "",
    "## Key Findings",
    `- Most important pass: ${formatCaseBullet(importantPassCase, "No pass boundary was recorded.")}.`,
    `- Most important failure: ${formatCaseBullet(importantFailureCase, "No failing boundary was recorded.")}.`,
    `- Evidence usability: ${deriveEvidenceUsability(prefixSummary, caseCount)}`,
    "",
    "## Layer Classification",
    `- Tool: ${layerSummary.tool}`,
    `- Scorer: ${layerSummary.scorer}`,
    `- Language: ${layerSummary.language}`,
    `- Transport: ${layerSummary.transport}`,
    "",
    "## Legal-system Interpretation",
    "- Committed state is law.",
    "- Logs and visible DOM text are admissible evidence.",
    "- Assistant prose is a claim, not state.",
    "- If evidence is ambiguous, HOLD and choose the smallest legal reduction.",
    "- PASS/FAIL describes route survival, not wording perfection.",
    "",
    "## Next Study Implication",
    deriveNextStudyImplication(prefixSummary),
    "",
    "## Artifact Paths",
    `- Raw evidence: \`${rawPath}\``,
    `- Review: \`${reviewPath}\``,
    "- Reflection loop: `study/CASEWORK_REFLECTION_LOOP_V1.md`",
    "- Case-law matrix: `study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.md`",
    "",
    "> Note: Human/LLM review may refine the language lesson. Update the classification in the index if the heuristic/scorer was wrong."
  ].join("\n");
}

function ensureReviewForResult({
  resultData,
  caseworkRoot,
  destJsonPath,
  destReviewPath,
  importedAt = new Date().toISOString()
}) {
  const generatedContent = buildReviewContent({
    resultData,
    caseworkRoot,
    destJsonPath,
    destReviewPath,
    importedAt
  });

  if (!fs.existsSync(destReviewPath)) {
    fs.writeFileSync(destReviewPath, generatedContent, "utf8");
    return { action: "created", placeholderFound: false };
  }

  const existingContent = fs.readFileSync(destReviewPath, "utf8");
  if (reviewHasPlaceholder(existingContent)) {
    fs.writeFileSync(destReviewPath, generatedContent, "utf8");
    return { action: "repaired", placeholderFound: true };
  }

  return { action: "kept", placeholderFound: false };
}

function findPlaceholderReviews(reviewsRoot) {
  const matches = [];
  if (!fs.existsSync(reviewsRoot)) {
    return matches;
  }

  for (const entry of fs.readdirSync(reviewsRoot, { withFileTypes: true })) {
    const fullPath = path.join(reviewsRoot, entry.name);
    if (entry.isDirectory()) {
      matches.push(...findPlaceholderReviews(fullPath));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf8");
    if (reviewHasPlaceholder(content)) {
      matches.push(fullPath);
    }
  }
  return matches;
}

export {
  REVIEW_PLACEHOLDER_PATTERNS,
  buildReviewContent,
  cleanText,
  ensureReviewForResult,
  findPlaceholderReviews,
  getCaseClassification,
  reviewHasPlaceholder,
  summarizeClassifications
};
