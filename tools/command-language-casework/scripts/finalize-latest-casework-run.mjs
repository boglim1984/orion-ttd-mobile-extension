import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caseworkRoot = path.resolve(__dirname, "..");
const studyDir = path.join(caseworkRoot, "study");
const runIndexJsonPath = path.join(studyDir, "index", "CASEWORK_RUN_INDEX.json");
const statePath = path.join(studyDir, ".finalizer-watch-state.json");
const lockfilePath = path.join(studyDir, ".casework-finalizer.lock");

// Lockfile logic
if (fs.existsSync(lockfilePath)) {
  try {
    const pidStr = fs.readFileSync(lockfilePath, "utf8").trim();
    if (pidStr) {
      const pid = parseInt(pidStr, 10);
      try {
        process.kill(pid, 0); // Check if process is alive
        console.log(`Finalizer already running (PID ${pid}). Exiting to prevent parallel execution.`);
        process.exit(0);
      } catch (err) {
        console.log(`Stale lockfile detected (PID ${pid} is dead). Clearing lock.`);
        fs.unlinkSync(lockfilePath);
      }
    }
  } catch (err) {
    console.log("Could not read/clear lockfile safely. Ignoring error.");
  }
}
try { fs.writeFileSync(lockfilePath, String(process.pid)); } catch(e) {}

function cleanupLock() {
  try {
    if (fs.existsSync(lockfilePath)) {
      const current = fs.readFileSync(lockfilePath, "utf8").trim();
      if (current === String(process.pid)) {
        fs.unlinkSync(lockfilePath);
      }
    }
  } catch (err) {}
}
process.on("exit", cleanupLock);
process.on("SIGINT", () => process.exit(1));
process.on("SIGTERM", () => process.exit(1));
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

const ARGS = process.argv.slice(2);
const FLAG_COMMIT = ARGS.includes("--commit");
const FLAG_PUSH = ARGS.includes("--push");
const FLAG_NO_REVIEW = ARGS.includes("--no-review");
const FLAG_ALLOW_MISMATCH = ARGS.includes("--allow-review-mismatch");

let manualResultPath = null;
let reviewFilePath = null;

for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === "--result" && ARGS[i+1]) manualResultPath = ARGS[++i];
  if (ARGS[i] === "--review-file" && ARGS[i+1]) reviewFilePath = ARGS[++i];
}

function exitFailure(step, reason, commandHint = "Try running with --help or investigate manually.") {
  console.error("\n=============================");
  console.error(" FINALIZATION FAILED");
  console.error("=============================\n");
  console.error(`Step: ${step}`);
  console.error(`Reason: ${reason}\n`);
  console.error(`Hint: ${commandHint}`);
  process.exit(1);
}

function runCmd(cmd, cwd, env = process.env) {
  try {
    return execSync(cmd, { cwd, env, encoding: "utf8" }).trim();
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\n${err.message}\n${err.stdout}\n${err.stderr}`);
  }
}

function extractJson(text) {
  let cleaned = text.trim();
  const mdMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
  if (mdMatch) cleaned = mdMatch[1];
  else {
    const rawMatch = cleaned.match(/\{[\s\S]*\}/);
    if (rawMatch) cleaned = rawMatch[0];
  }
  return cleaned;
}

function markStateCompleted(suite_id, run_id) {
  let state = {};
  if (fs.existsSync(statePath)) {
    try { state = JSON.parse(fs.readFileSync(statePath, "utf8")); } catch(err) {}
  }
  const key = `${suite_id}__${run_id}`;
  state[key] = {
    ...state[key],
    suite_id,
    run_id,
    state: "completed",
    completed_at: new Date().toISOString()
  };
  try { fs.writeFileSync(statePath, JSON.stringify(state, null, 2)); } catch(e) {}
}

// 1. Locate Latest Result
let resultPath = manualResultPath;
if (!resultPath) {
  const dirsToScan = [
    path.join(os.homedir(), "Downloads"),
    path.join(os.homedir(), "Desktop")
  ];
  let candidates = [];
  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.startsWith("orion-casework-result-") && f.endsWith(".json")) {
          const fullPath = path.join(dir, f);
          const stat = fs.statSync(fullPath);
          candidates.push({ path: fullPath, mtimeMs: stat.mtimeMs });
        }
      }
    } catch (err) {}
  }
  if (candidates.length === 0) {
    exitFailure("Locate result file", "No file matching orion-casework-result-*.json found.", "Provide --result <path>");
  }
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  resultPath = candidates[0].path;
}

if (!fs.existsSync(resultPath)) exitFailure("Locate result file", `File not found: ${resultPath}`);

let resultData;
try {
  resultData = JSON.parse(fs.readFileSync(resultPath, "utf8"));
} catch (err) {
  exitFailure("Parse JSON", `Could not parse JSON from ${resultPath}: ${err.message}`);
}
if (!resultData.run_id || !resultData.suite_id) {
  exitFailure("Validate Result", `JSON missing run_id or suite_id.`);
}

console.log(`Found result: ${resultPath}`);
console.log(`Suite ID: ${resultData.suite_id}`);
console.log(`Run ID: ${resultData.run_id}`);

// Determine paths
const runDateMatch = resultData.run_id.match(/^(\d{4})(\d{2})(\d{2})-/);
const dateFolder = runDateMatch ? `${runDateMatch[1]}-${runDateMatch[2]}-${runDateMatch[3]}` : new Date().toISOString().split("T")[0];
const importedRawPath = path.join(studyDir, "raw", dateFolder, `${resultData.suite_id}__${resultData.run_id}.json`);
const captureDir = path.join(studyDir, "review-captures", dateFolder);
const capturePath = path.join(captureDir, `${resultData.suite_id}__${resultData.run_id}__CASEWORK_REVIEW_V1.json`);

let isAlreadyImported = false;
if (fs.existsSync(runIndexJsonPath)) {
  try {
    const runIndex = JSON.parse(fs.readFileSync(runIndexJsonPath, "utf8"));
    if (runIndex.some(r => r.run_id === resultData.run_id && r.suite_id === resultData.suite_id)) {
      isAlreadyImported = true;
    }
  } catch (err) {}
}

const captureExists = fs.existsSync(capturePath);

if (isAlreadyImported && captureExists) {
  console.log("\n=============================");
  console.log(" RESULT & REVIEW ALREADY IMPORTED");
  console.log("=============================\n");
  console.log("This run has already been imported and has a review capture. Exiting cleanly.");
  markStateCompleted(resultData.suite_id, resultData.run_id);
  process.exit(0);
}

if (isAlreadyImported && !captureExists) {
  console.log("\nResult already imported, but missing CASEWORK_REVIEW_V1 capture. Proceeding to review phase.");
}

async function getReviewText() {
  if (reviewFilePath) return fs.readFileSync(reviewFilePath, "utf8");
  
  return new Promise((resolve) => {
    console.log("\n=============================");
    console.log(" RESEARCH RUN DETECTED");
    console.log("=============================\n");
    console.log("Paste the CASEWORK_REVIEW_V1 JSON block from the test chat.");
    console.log("End with a line containing only: CASEWORK_REVIEW_V1_END");
    console.log("---------------------------------------------------------");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let lines = [];
    rl.on("line", (line) => {
      if (line.trim() === "CASEWORK_REVIEW_V1_END") {
        rl.close();
      } else {
        lines.push(line);
      }
    });
    rl.on("close", () => resolve(lines.join("\n")));
  });
}

let reviewObj = null;

if (!FLAG_NO_REVIEW) {
  const rawReviewText = await getReviewText();
  const cleanedText = extractJson(rawReviewText);
  try {
    reviewObj = JSON.parse(cleanedText);
  } catch(err) {
    exitFailure("Review Parse", `Could not parse the pasted text as JSON. Make sure you copied the full block.\n${err.message}`);
  }

  if (reviewObj.schema !== "CASEWORK_REVIEW_V1") {
    exitFailure("Review Schema", `Schema must be CASEWORK_REVIEW_V1, got ${reviewObj.schema}`);
  }
  if (!FLAG_ALLOW_MISMATCH && (reviewObj.suite_id !== resultData.suite_id || reviewObj.run_id !== resultData.run_id)) {
    exitFailure("Review Mismatch", `Review run_id/suite_id (${reviewObj.suite_id}/${reviewObj.run_id}) do not match imported result (${resultData.suite_id}/${resultData.run_id}). Use --allow-review-mismatch to force.`);
  }
  if (!reviewObj.pointer_update || !reviewObj.pointer_update.next_study_needed) {
    exitFailure("Review Validation", "Missing required field: pointer_update.next_study_needed");
  }
  const pu = reviewObj.pointer_update;
  const reqFields = ["purpose", "evidence_reviewed", "current_confidence", "open_gap", "test_strategy", "avoid", "suite_shape_recommendation", "retirement_condition", "next_action_for_fresh_chat"];
  for (const f of reqFields) {
    if (!pu[f]) exitFailure("Review Validation", `pointer_update missing required field: ${f}`);
  }

  reviewObj.reviewed_at = reviewObj.reviewed_at || new Date().toISOString();
  
  // Save Review Capture
  fs.mkdirSync(captureDir, { recursive: true });
  const captureData = {
    original_review: reviewObj,
    imported_result_path: path.relative(caseworkRoot, importedRawPath),
    applied_pointer_update: pu,
    applied_at: new Date().toISOString()
  };
  fs.writeFileSync(capturePath, JSON.stringify(captureData, null, 2));
  console.log(`\n--> Saved review capture to ${path.relative(caseworkRoot, capturePath)}`);

  // Apply pointer update
  const statusPath = path.join(studyDir, "CASEWORK_STUDY_STATUS.json");
  let statusObj = { manual_next_study: {} };
  if (fs.existsSync(statusPath)) {
    try {
      statusObj = JSON.parse(fs.readFileSync(statusPath, "utf8"));
    } catch(err) {}
  }
  statusObj.manual_next_study = { ...statusObj.manual_next_study, ...pu };
  statusObj.manual_next_study.source = `Post-run CASEWORK_REVIEW_V1 for ${resultData.suite_id} result ${resultData.run_id}.`;
  statusObj.manual_next_study.set_by = "Billy / ChatGPT post-run review";
  statusObj.manual_next_study.set_at = new Date().toISOString().split("T")[0];

  fs.writeFileSync(statusPath, JSON.stringify(statusObj, null, 2));
  console.log("--> Applied pointer_update to CASEWORK_STUDY_STATUS.json");
} else {
  console.log("\n--> Skipping review phase (--no-review)");
}

// 3. Import
if (!isAlreadyImported) {
  console.log("\n--> Importing result...");
  try {
    runCmd(`node scripts/import-casework-result.mjs "${resultPath}"`, caseworkRoot);
  } catch (err) {
    exitFailure("Import result", err.message);
  }
}

// 4. Tabulate
console.log("--> Regenerating study artifacts...");
try {
  runCmd(`node scripts/tabulate-casework-study.mjs`, caseworkRoot);
} catch (err) {
  exitFailure("Tabulate study", err.message);
}

// 5. Sync Mirror
console.log("--> Syncing Command Center mirror...");
try {
  runCmd(`node scripts/sync-casework-study-status-skill.mjs`, caseworkRoot);
} catch (err) {
  exitFailure("Sync mirror", err.message);
}

// 6. Rebuild Index
const commandCenterRoot = path.join(os.homedir(), "Desktop", "Code Projects", "ACTIVE", "_worktrees", "Billy-Project-Command-Center-main-for-skill-dump");
console.log("--> Rebuilding Command Center skill index...");
if (fs.existsSync(commandCenterRoot)) {
  try {
    runCmd(`python3 scripts/build_skill_index.py`, commandCenterRoot);
  } catch (err) {
    console.warn(`Warning: Could not rebuild skill index in ${commandCenterRoot}: ${err.message}`);
  }
} else {
  console.warn(`Warning: Command Center not found at ${commandCenterRoot}`);
}

// 7. Refresh Bundle
console.log("--> Refreshing Casework Start bundle...");
try {
  runCmd(`"${path.join(os.homedir(), "Desktop", "Casework Start.command")}"`, __dirname);
} catch (err) {
  console.warn(`Warning: Could not refresh Casework Start bundle: ${err.message}`);
}

// 8. Verify
let statusObj2;
try {
  statusObj2 = JSON.parse(fs.readFileSync(path.join(studyDir, "CASEWORK_STUDY_STATUS.json"), "utf8"));
} catch(err) {}

const currentPointer = statusObj2?.manual_next_study?.next_study_needed || "None";

console.log("\n=============================");
console.log(" FINALIZATION SUCCESSFUL");
console.log("=============================\n");
if (reviewObj) console.log(`Review Capture:     ${path.relative(caseworkRoot, capturePath)}`);
console.log(`Latest Pointer:     ${currentPointer}`);
console.log(`Latest Run Visible: ${statusObj2?.computed_summary?.latest_run_id}`);

markStateCompleted(resultData.suite_id, resultData.run_id);

// 9. Git Operations
const orionRepoRoot = runCmd("git rev-parse --show-toplevel", caseworkRoot);
let githubSynced = false;
let orionCommitted = false;
let ccCommitted = false;

if (FLAG_COMMIT) {
  console.log("\n--> Staging and committing changes...");
  try {
    const gitAddCmd = `git add tools/command-language-casework/study/CASEWORK_EVIDENCE_DIGEST.md tools/command-language-casework/study/CASEWORK_STUDY_STATUS.json tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.csv tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.jsonl tools/command-language-casework/study/case-law/CASEWORK_CASE_LAW_MATRIX_V1.md tools/command-language-casework/study/index/CASEWORK_CASE_INDEX.csv tools/command-language-casework/study/index/CASEWORK_RUN_INDEX.json tools/command-language-casework/study/raw/ tools/command-language-casework/study/reviews/ tools/command-language-casework/study/review-captures/ tools/command-language-casework/injectors/chatgpt-casework-runner.js tools/command-language-casework/public/casework-ui.js tools/command-language-casework/scripts/finalize-latest-casework-run.mjs tools/command-language-casework/scripts/finalize-latest-casework-run.sh tools/command-language-casework/scripts/install-casework-end-command.sh tools/command-language-casework/scripts/install-casework-end-watcher.sh tools/command-language-casework/scripts/uninstall-casework-end-watcher.sh tools/command-language-casework/scripts/casework-end-watch-loop.mjs tools/command-language-casework/docs/`;
    runCmd(gitAddCmd, orionRepoRoot);
    
    const status = runCmd(`git status --porcelain`, orionRepoRoot);
    if (status.length > 0) {
      runCmd(`git commit -m "Finalize casework run ${resultData.suite_id}"`, orionRepoRoot);
      console.log("Committed local Orion repository.");
      orionCommitted = true;
    } else {
      console.log("No Orion changes to commit.");
    }
    
    if (fs.existsSync(commandCenterRoot)) {
      runCmd(`git add library/skills/chatgpt/command-language-casework-current-study-status-skill.md library/skills/SKILL_INDEX.*`, commandCenterRoot);
      const ccStatus = runCmd(`git status --porcelain`, commandCenterRoot);
      if (ccStatus.length > 0) {
        runCmd(`git commit -m "Sync casework study status for ${currentPointer}"`, commandCenterRoot);
        console.log("Committed Command Center mirror.");
        ccCommitted = true;
      }
    }
  } catch (err) {
    exitFailure("Git Commit", err.message);
  }
}

if (FLAG_PUSH) {
  console.log("\n--> Pushing to GitHub...");
  try {
    let orionPushed = true;
    let ccPushed = true;
    
    if (orionCommitted) {
      runCmd(`git push`, orionRepoRoot);
    } else {
      const unpushed = runCmd("git cherry -v", orionRepoRoot);
      if (unpushed) runCmd(`git push`, orionRepoRoot);
    }
    
    if (ccCommitted && fs.existsSync(commandCenterRoot)) {
      runCmd(`git push`, commandCenterRoot);
    } else if (fs.existsSync(commandCenterRoot)) {
      const unpushedCC = runCmd("git cherry -v", commandCenterRoot);
      if (unpushedCC) runCmd(`git push`, commandCenterRoot);
    }
    
    githubSynced = true;
    console.log("GitHub synced: yes");
  } catch (err) {
    console.error(`Warning: Git push failed: ${err.message}`);
  }
}

if (!githubSynced && FLAG_COMMIT) {
  console.log("\nLOCAL UPDATED BUT NOT PUSHED TO GITHUB");
  console.log("Fresh chats that inspect GitHub may see stale status.");
  console.log("Use --push or run git push manually.");
}

console.log("\nReady for the next test.");
