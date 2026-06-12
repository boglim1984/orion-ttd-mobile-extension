import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const { formatWorkflowRunSummary, runAllWorkflowFixtures } = require("../src/reducer/fixtureRunner.js");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesDir = path.join(repoRoot, "test-fixtures", "workflows");
const reportsDir = path.join(repoRoot, "reports", "milestone-6c");
const jsonReportPath = path.join(reportsDir, "workflow-fixture-run-report.json");
const markdownSummaryPath = path.join(reportsDir, "workflow-fixture-run-summary.md");

fs.mkdirSync(reportsDir, { recursive: true });

const report = runAllWorkflowFixtures(fixturesDir);
const summaryMarkdown = formatWorkflowRunSummary(report);

fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(markdownSummaryPath, summaryMarkdown);

console.log(`Wrote ${jsonReportPath}`);
console.log(`Wrote ${markdownSummaryPath}`);
console.log(`Fixtures: ${report.fixture_count}`);
console.log(`Events: ${report.total_events}`);
console.log(`Pass: ${report.pass_count}`);
console.log(`Pass with repair: ${report.pass_with_repair_count}`);
console.log(`Fail: ${report.fail_count}`);

if (report.fail_count > 0) {
  process.exitCode = 1;
}
