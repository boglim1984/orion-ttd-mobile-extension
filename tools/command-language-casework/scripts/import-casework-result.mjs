#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function showHelp() {
  console.log(`
Usage:
  node import-casework-result.mjs <result-json-path> [options]

Options:
  --review-note "text"     Add a note to the review stub
  --next-study "text"      Set the next-study implication placeholder
  --commit                 Commit the imported files (no push)
  --push                   Push after committing (requires --commit)
  `);
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  const resultPath = args.find((a) => !a.startsWith("--"));
  if (!resultPath) {
    console.error("Error: Missing <result-json-path>");
    process.exit(1);
  }

  let reviewNote = "";
  let nextStudy = "";
  let commit = false;
  let push = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--review-note" && i + 1 < args.length) {
      reviewNote = args[++i];
    } else if (args[i] === "--next-study" && i + 1 < args.length) {
      nextStudy = args[++i];
    } else if (args[i] === "--commit") {
      commit = true;
    } else if (args[i] === "--push") {
      push = true;
    }
  }

  return { resultPath, reviewNote, nextStudy, commit, push };
}

function safeFileName(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getCaseClassification(c) {
  const fields = [
    c.classification,
    c.final_classification,
    c.result_classification,
    c.heuristic_classification,
    c.tool_failure_label,
    c.tool_classification,
    c.assistant_classification
  ];
  for (const f of fields) {
    if (f && typeof f === "string" && f.trim() !== "") {
      return f;
    }
  }
  return "UNKNOWN";
}

function summarizeClassifications(cases) {
  const counts = {};
  for (const c of cases) {
    const cl = getCaseClassification(c);
    counts[cl] = (counts[cl] || 0) + 1;
  }
  return counts;
}

function main() {
  const { resultPath, reviewNote, nextStudy, commit, push } = parseArgs();

  const absolutePath = path.resolve(resultPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`);
    process.exit(1);
  }

  let rawJson;
  try {
    rawJson = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }

  let resultData;
  try {
    resultData = JSON.parse(rawJson);
  } catch (error) {
    console.error(`Error: Not a valid JSON file. ${error.message}`);
    process.exit(1);
  }

  if (!resultData.suite_id || !resultData.run_id) {
    console.error("Error: JSON must have suite_id and run_id");
    process.exit(1);
  }

  const safeSuiteId = safeFileName(resultData.suite_id);
  const safeRunId = safeFileName(resultData.run_id);
  
  // Extract date from run_id if it follows YYYYMMDD format, otherwise use today
  let yyyyMmDd = new Date().toISOString().split("T")[0];
  const dateMatch = resultData.run_id.match(/^(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    yyyyMmDd = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }

  const projectRoot = path.resolve(__dirname, "../../..");
  const caseworkRoot = path.join(projectRoot, "tools/command-language-casework");
  const studyDir = path.join(caseworkRoot, "study");
  const rawDir = path.join(studyDir, "raw", yyyyMmDd);
  const reviewsDir = path.join(studyDir, "reviews", yyyyMmDd);

  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(reviewsDir, { recursive: true });

  const destJsonPath = path.join(rawDir, `${safeSuiteId}__${safeRunId}.json`);
  const destReviewPath = path.join(reviewsDir, `${safeSuiteId}__${safeRunId}.md`);

  fs.copyFileSync(absolutePath, destJsonPath);

  const cases = Array.isArray(resultData.cases) ? resultData.cases : [];
  const caseCount = cases.length;
  const classificationSummary = summarizeClassifications(cases);

  let summaryLines = [];
  for (const [cl, count] of Object.entries(classificationSummary)) {
    summaryLines.push(`- **${cl}**: ${count}`);
  }

  const reviewContent = [
    `# Casework Review: ${resultData.suite_id}`,
    ``,
    `- **Run ID**: \`${resultData.run_id}\``,
    `- **Imported At**: ${new Date().toISOString()}`,
    `- **Case Count**: ${caseCount}`,
    ``,
    `## Classification Summary`,
    summaryLines.length ? summaryLines.join("\n") : "- None",
    ``,
    `## Key Findings`,
    reviewNote ? reviewNote : "*(Add notes on the most important pass/fail observed here)*",
    ``,
    `## Next Study Implication`,
    nextStudy ? nextStudy : "*(What should the next suite test?)*",
    ``,
    `> Note: Human/LLM review may refine the language lesson. Update the classification in the index if the heuristic/scorer was wrong.`
  ].join("\n");

  if (!fs.existsSync(destReviewPath)) {
    fs.writeFileSync(destReviewPath, reviewContent, "utf8");
    console.log(`Created review stub: ${path.relative(caseworkRoot, destReviewPath)}`);
  } else {
    console.log(`Review stub already exists: ${path.relative(caseworkRoot, destReviewPath)}`);
  }

  console.log(`Saved raw result: ${path.relative(caseworkRoot, destJsonPath)}`);

  if (commit) {
    try {
      execSync("git status", { stdio: "ignore", cwd: projectRoot });
      
      const gitAddRaw = `git add "${path.relative(projectRoot, destJsonPath)}"`;
      const gitAddReview = `git add "${path.relative(projectRoot, destReviewPath)}"`;
      execSync(gitAddRaw, { cwd: projectRoot });
      execSync(gitAddReview, { cwd: projectRoot });

      const commitMsg = `Import casework result ${resultData.suite_id}`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: projectRoot });
      console.log(`Committed: ${commitMsg}`);

      if (push) {
        execSync("git push", { cwd: projectRoot });
        console.log("Pushed to remote.");
      }
    } catch (error) {
      console.error("Git operation failed. Do you have uncommitted changes or no remote?");
      console.error(error.message);
    }
  } else {
    console.log("\nNot committing. You can commit manually:");
    console.log(`  git add "${path.relative(projectRoot, destJsonPath)}" "${path.relative(projectRoot, destReviewPath)}"`);
    console.log(`  git commit -m "Import casework result ${resultData.suite_id}"`);
  }
}

main();
