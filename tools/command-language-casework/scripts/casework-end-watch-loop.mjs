import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const caseworkRoot = path.resolve(__dirname, "..");
const studyDir = path.join(caseworkRoot, "study");
const statePath = path.join(studyDir, ".finalizer-watch-state.json");
const logDir = path.join(studyDir, "logs");
const logFile = path.join(logDir, "casework-end-watcher.log");

fs.mkdirSync(logDir, { recursive: true });

function logMsg(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line.trim());
}

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
        candidates.push(fullPath);
      }
    }
  } catch (err) {}
}

if (candidates.length === 0) {
  process.exit(0);
}

// Ensure state file exists
let state = {};
if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch(err) {}
}

for (const resultPath of candidates) {
  // Check size stability to avoid partial downloads
  const stat1 = fs.statSync(resultPath);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500); // Wait 500ms
  const stat2 = fs.statSync(resultPath);
  
  if (stat1.size !== stat2.size) {
    continue; // File still writing
  }

  // Verify JSON parse
  let resultData;
  try {
    resultData = JSON.parse(fs.readFileSync(resultPath, "utf8"));
  } catch (err) {
    continue; // Not valid JSON yet
  }
  
  if (!resultData.run_id || !resultData.suite_id) {
    continue;
  }
  
  const key = `${resultData.suite_id}__${resultData.run_id}`;
  const currentState = state[key]?.state;
  
  if (currentState === "launched" || currentState === "completed") {
    // Already handled
    continue;
  }
  
  // Mark as launched
  state[key] = {
    suite_id: resultData.suite_id,
    run_id: resultData.run_id,
    path: resultPath,
    state: "launched",
    launched_at: new Date().toISOString()
  };
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  
  logMsg(`Detected new result: ${resultPath} (Suite: ${resultData.suite_id}, Run: ${resultData.run_id}). Launching Casework End.`);
  
  // Launch terminal using osascript to run the finalizer
  const repoRoot = execSync("git rev-parse --show-toplevel", { cwd: caseworkRoot, encoding: "utf8" }).trim();
  const scriptToRun = `cd \\"${repoRoot}\\" && tools/command-language-casework/scripts/finalize-latest-casework-run.sh --result \\"${resultPath}\\" --commit --push`;
  
  const appleScript = `
    tell application "Terminal"
      activate
      do script "${scriptToRun}"
    end tell
  `;
  
  try {
    execSync(`osascript -e '${appleScript}'`);
    logMsg(`Successfully spawned Terminal for ${resultData.run_id}`);
  } catch (err) {
    logMsg(`Failed to spawn Terminal: ${err.message}`);
  }
}
