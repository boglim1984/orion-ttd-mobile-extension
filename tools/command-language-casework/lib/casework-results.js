const fs = require("node:fs");
const path = require("node:path");

function slugify(value) {
  return String(value || "casework")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "casework";
}

function formatTimestamp(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildCaseLogMarkdown(caseResult) {
  const lines = [
    `# ${caseResult.case_id}`,
    "",
    `- heuristic classification: ${caseResult.heuristic_classification}`,
    `- packet sent: ${caseResult.packet_sent ? "yes" : "no"}`,
    `- scripted replies sent: ${(caseResult.scripted_user_replies_sent || []).join(", ") || "none"}`,
    `- observed keywords: ${(caseResult.observed_chunks_or_keywords || []).join(", ") || "none"}`,
    `- notes: ${caseResult.notes || "none"}`,
    ""
  ];

  if (Array.isArray(caseResult.assistant_responses) && caseResult.assistant_responses.length > 0) {
    lines.push("## Assistant Responses", "");
    caseResult.assistant_responses.forEach((response, index) => {
      lines.push(`${index + 1}. ${response}`, "");
    });
  }

  if (Array.isArray(caseResult.raw_turn_log) && caseResult.raw_turn_log.length > 0) {
    lines.push("## Raw Turn Log", "");
    caseResult.raw_turn_log.forEach((turn) => {
      lines.push(`- [${turn.at}] ${turn.actor}: ${turn.text}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

function buildRawTranscriptText(cases) {
  const lines = [];
  cases.forEach((caseResult) => {
    lines.push(`=== ${caseResult.case_id} ===`);
    (caseResult.raw_turn_log || []).forEach((turn) => {
      lines.push(`[${turn.at}] ${turn.actor}: ${turn.text}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function buildRunSummaryMarkdown(runResult, outputPaths) {
  const lines = [
    "# Command Language Casework Run Summary",
    "",
    `- suite_id: ${runResult.suite_id}`,
    `- run_id: ${runResult.run_id}`,
    `- started_at: ${runResult.started_at}`,
    `- completed_at: ${runResult.completed_at}`,
    `- browser_context_note: ${runResult.browser_context_note}`,
    `- tool_version: ${runResult.tool_version}`,
    `- input suite: ${path.basename(outputPaths.inputSuitePath)}`,
    `- run result json: ${path.basename(outputPaths.runResultPath)}`,
    ""
  ];

  lines.push("## Case Results", "");
  runResult.cases.forEach((caseResult) => {
    lines.push(`### ${caseResult.case_id}`, "");
    lines.push(`- heuristic classification: ${caseResult.heuristic_classification}`);
    lines.push(`- visible turn text: ${caseResult.visible_turn_text || "none"}`);
    lines.push(`- expected behavior count: ${(caseResult.expected_behavior || []).length}`);
    lines.push(`- forbidden behavior count: ${(caseResult.forbidden_behavior || []).length}`);
    lines.push(`- notes: ${caseResult.notes || "none"}`);
    lines.push("");
  });

  if ((runResult.warnings || []).length > 0) {
    lines.push("## Warnings", "");
    runResult.warnings.forEach((warning) => lines.push(`- ${warning}`));
    lines.push("");
  }

  if ((runResult.errors || []).length > 0) {
    lines.push("## Errors", "");
    runResult.errors.forEach((error) => lines.push(`- ${error}`));
    lines.push("");
  }

  return lines.join("\n");
}

function writeCaseworkRunResults({ resultsRoot, suite, runResult }) {
  const folderName = `${formatTimestamp(new Date(runResult.started_at || Date.now()))}-${slugify(
    suite.suite_id
  )}`;
  const outputDir = path.join(resultsRoot, folderName);
  const caseLogsDir = path.join(outputDir, "case-logs");
  const screenshotsDir = path.join(outputDir, "screenshots");

  ensureDir(outputDir);
  ensureDir(caseLogsDir);
  ensureDir(screenshotsDir);

  const inputSuitePath = path.join(outputDir, "input-suite.json");
  const runResultPath = path.join(outputDir, "run-result.json");
  const runJsonlPath = path.join(outputDir, "run-result.jsonl");
  const runSummaryPath = path.join(outputDir, "run-summary.md");
  const rawTranscriptPath = path.join(outputDir, "raw-transcript.txt");

  fs.writeFileSync(inputSuitePath, JSON.stringify(suite, null, 2));
  fs.writeFileSync(runResultPath, JSON.stringify(runResult, null, 2));
  fs.writeFileSync(
    runJsonlPath,
    `${runResult.cases.map((caseResult) => JSON.stringify(caseResult)).join("\n")}\n`
  );
  fs.writeFileSync(rawTranscriptPath, buildRawTranscriptText(runResult.cases));

  runResult.cases.forEach((caseResult) => {
    fs.writeFileSync(
      path.join(caseLogsDir, `${slugify(caseResult.case_id)}.md`),
      buildCaseLogMarkdown(caseResult)
    );
  });

  const outputPaths = {
    outputDir,
    inputSuitePath,
    runResultPath,
    runJsonlPath,
    runSummaryPath,
    rawTranscriptPath,
    caseLogsDir,
    screenshotsDir
  };

  fs.writeFileSync(runSummaryPath, buildRunSummaryMarkdown(runResult, outputPaths));

  return outputPaths;
}

module.exports = {
  buildRunSummaryMarkdown,
  formatTimestamp,
  slugify,
  writeCaseworkRunResults
};
