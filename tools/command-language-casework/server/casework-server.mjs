import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const {
  CASEWORK_TOOL_VERSION,
  formatTimestamp,
  validateSuiteText,
  loadSuiteFromFile
} = (() => {
  const validator = require("../lib/casework-validator.js");
  const results = require("../lib/casework-results.js");
  return {
    ...validator,
    ...results
  };
})();
const { classifyCaseResult, extractObservedKeywords } = require("../lib/casework-heuristics.js");
const { writeCaseworkRunResults } = require("../lib/casework-results.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOL_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(TOOL_ROOT, "public");
const RESULTS_DIR = path.join(TOOL_ROOT, "results");
const DRAFTS_DIR = path.join(TOOL_ROOT, "drafts");
const INJECTOR_PATH = path.join(TOOL_ROOT, "injectors", "chatgpt-casework-runner.js");
const DEFAULT_PORT = 4317;
const DEFAULT_HOST = "127.0.0.1";
const INDEX_HTML_PATH = path.join(PUBLIC_DIR, "index.html");

const state = {
  tool_version: CASEWORK_TOOL_VERSION,
  started_at: new Date().toISOString(),
  runner: null,
  pending_run: null,
  active_run: null,
  stop_requested: false,
  status_log: [],
  last_result: null
};

function ensureToolDirs() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
}

function logStatus(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  state.status_log.push(line);
  state.status_log = state.status_log.slice(-200);
  console.log(line);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "content-type": contentType,
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  response.end(text);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const bodyText = Buffer.concat(chunks).toString("utf8");
      if (!bodyText) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(bodyText));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function getBootstrapSnippet(port) {
  return `fetch("http://127.0.0.1:${port}/api/runner/bootstrap.js")\n  .then((response) => response.text())\n  .then((source) => {\n    eval(source);\n    window.OrionCommandLanguageCaseworkRunner.install({\n      serverBaseUrl: "http://127.0.0.1:${port}"\n    });\n  });`;
}

function getBootstrapScript(port) {
  const source = fs.readFileSync(INJECTOR_PATH, "utf8");
  return `${source}\nwindow.OrionCommandLanguageCaseworkRunner.install({ serverBaseUrl: "http://127.0.0.1:${port}" });\n`;
}

function getSelfContainedPayload({ suite, runId, port }) {
  const source = fs.readFileSync(INJECTOR_PATH, "utf8");
  return `${source}
window.OrionCommandLanguageCaseworkRunner.installSelfContained({
  runId: ${JSON.stringify(runId)},
  serverBaseUrl: ${JSON.stringify(`http://127.0.0.1:${port}`)},
  suite: ${JSON.stringify(suite, null, 2)}
});
`;
}

function revealInFinder(targetPath) {
  try {
    execFileSync("open", ["-R", targetPath]);
    return true;
  } catch (_error) {
    return false;
  }
}

function createRunId(suiteId) {
  return `${formatTimestamp(new Date())}-${suiteId}`;
}

function buildServerRunState(suite) {
  return {
    run_id: createRunId(suite.suite_id),
    suite,
    requested_at: new Date().toISOString(),
    current_case_id: null,
    runner_id: null
  };
}

function summarizeResultPaths(paths) {
  return {
    output_dir: paths.outputDir,
    summary_path: paths.runSummaryPath,
    result_json_path: paths.runResultPath,
    result_jsonl_path: paths.runJsonlPath,
    raw_transcript_path: paths.rawTranscriptPath
  };
}

function enrichCaseResults(runResult) {
  runResult.cases = (runResult.cases || []).map((caseResult) => {
    const heuristic = classifyCaseResult(caseResult);
    return {
      ...caseResult,
      observed_chunks_or_keywords: extractObservedKeywords(caseResult),
      heuristic_classification: heuristic.label,
      heuristic_notes: heuristic.reasons
    };
  });
  return runResult;
}

async function handleApi(request, response, url, port) {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/state") {
    sendJson(response, 200, {
      ok: true,
      ...state
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/runner/loader-snippet") {
    sendText(response, 200, getBootstrapSnippet(port));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/runner/bootstrap.js") {
    sendText(response, 200, getBootstrapScript(port), "application/javascript; charset=utf-8");
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/latest-summary") {
    if (!state.last_result?.summary_path || !fs.existsSync(state.last_result.summary_path)) {
      sendText(response, 404, "No result summary exists yet.");
      return;
    }
    sendText(response, 200, fs.readFileSync(state.last_result.summary_path, "utf8"));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runner/self-contained-payload") {
    const body = await readJsonBody(request);
    const validation = validateSuiteText(body.suite_text || "");
    if (!validation.ok) {
      sendJson(response, 400, validation);
      return;
    }

    const runId = createRunId(validation.suite.suite_id);
    sendJson(response, 200, {
      ok: true,
      run_id: runId,
      payload: getSelfContainedPayload({
        suite: validation.suite,
        runId,
        port
      })
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/validate") {
    const body = await readJsonBody(request);
    const validation = validateSuiteText(body.suite_text || "");
    sendJson(response, validation.ok ? 200 : 400, {
      ok: validation.ok,
      errors: validation.errors || [],
      suite: validation.ok ? validation.suite : null
    });
    if (validation.ok) {
      logStatus(`Validated suite ${validation.suite.suite_id}`);
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/save-draft") {
    const body = await readJsonBody(request);
    const validation = validateSuiteText(body.suite_text || "");
    if (!validation.ok) {
      sendJson(response, 400, validation);
      return;
    }

    const filePath = path.join(
      DRAFTS_DIR,
      `${formatTimestamp(new Date())}-${validation.suite.suite_id}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(validation.suite, null, 2));
    logStatus(`Saved suite draft ${filePath}`);
    sendJson(response, 200, {
      ok: true,
      draft_path: filePath
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/run") {
    const body = await readJsonBody(request);
    const validation = validateSuiteText(body.suite_text || "");
    if (!validation.ok) {
      sendJson(response, 400, validation);
      return;
    }

    state.pending_run = buildServerRunState(validation.suite);
    state.active_run = null;
    state.stop_requested = false;
    logStatus(
      `Queued suite ${validation.suite.suite_id} as ${state.pending_run.run_id}. Waiting for injected runner.`
    );
    sendJson(response, 200, {
      ok: true,
      run_id: state.pending_run.run_id
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/stop") {
    state.stop_requested = true;
    logStatus("Stop requested.");
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/open-latest-result") {
    if (!state.last_result?.summary_path) {
      sendJson(response, 404, {
        ok: false,
        errors: ["No result folder exists yet."]
      });
      return;
    }

    const revealed = revealInFinder(state.last_result.summary_path);
    sendJson(response, revealed ? 200 : 500, {
      ok: revealed,
      errors: revealed ? [] : ["Finder reveal failed."]
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runner/heartbeat") {
    const body = await readJsonBody(request);
    state.runner = {
      runner_id: body.runner_id,
      href: body.href,
      title: body.title,
      tool_version: body.tool_version,
      last_seen_at: new Date().toISOString()
    };
    sendJson(response, 200, {
      ok: true,
      stop_requested: state.stop_requested
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/runner/next") {
    const runnerId = url.searchParams.get("runner_id");
    if (state.pending_run && runnerId) {
      state.pending_run.runner_id = runnerId;
      state.active_run = state.pending_run;
      state.pending_run = null;
      logStatus(`Runner ${runnerId} accepted run ${state.active_run.run_id}`);
      sendJson(response, 200, {
        ok: true,
        run: state.active_run
      });
      return;
    }

    sendJson(response, 200, {
      ok: true,
      run: null
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runner/progress") {
    const body = await readJsonBody(request);
    if (state.active_run) {
      state.active_run.current_case_id = body.case_id || null;
    }
    logStatus(`${body.status || "progress"} ${body.case_id || ""} ${body.message || ""}`.trim());
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runner/report-run") {
    const body = await readJsonBody(request);
    const suite = state.active_run?.suite || state.pending_run?.suite || { suite_id: body.suite_id || "unknown" };
    const enrichedRunResult = enrichCaseResults({
      ...body,
      browser_context_note:
        body.browser_context_note ||
        "Real ChatGPT page with console-injected local casework runner.",
      tool_version: CASEWORK_TOOL_VERSION,
      warnings: body.warnings || [],
      errors: body.errors || []
    });

    const outputPaths = writeCaseworkRunResults({
      resultsRoot: RESULTS_DIR,
      suite,
      runResult: enrichedRunResult
    });

    state.last_result = summarizeResultPaths(outputPaths);
    state.active_run = null;
    state.pending_run = null;
    state.stop_requested = false;
    revealInFinder(outputPaths.runSummaryPath);
    logStatus(`Wrote casework results to ${outputPaths.outputDir}`);
    sendJson(response, 200, {
      ok: true,
      ...state.last_result
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runner/self-contained-result") {
    const body = await readJsonBody(request);
    const suite = body.suite || { suite_id: body.runResult?.suite_id || "unknown" };
    const runResult = enrichCaseResults({
      ...body.runResult,
      browser_context_note:
        body.runResult?.browser_context_note ||
        "Real ChatGPT page with self-contained console payload.",
      tool_version: CASEWORK_TOOL_VERSION,
      warnings: body.runResult?.warnings || [],
      errors: body.runResult?.errors || []
    });

    const outputPaths = writeCaseworkRunResults({
      resultsRoot: RESULTS_DIR,
      suite,
      runResult
    });

    state.last_result = summarizeResultPaths(outputPaths);
    revealInFinder(outputPaths.runSummaryPath);
    logStatus(`Wrote self-contained casework results to ${outputPaths.outputDir}`);
    sendJson(response, 200, {
      ok: true,
      ...state.last_result
    });
    return;
  }

  sendJson(response, 404, {
    ok: false,
    errors: [`Unknown API path: ${url.pathname}`]
  });
}

function resolvePort(value, fallback = DEFAULT_PORT) {
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : fallback;
}

function serveStatic(response, urlPathname) {
  const requestedPath = urlPathname === "/" ? "/index.html" : urlPathname;
  const filePath = path.join(PUBLIC_DIR, requestedPath.replace(/^\/+/, ""));

  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    sendText(response, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8"
  };
  sendText(response, 200, fs.readFileSync(filePath, "utf8"), contentTypes[ext] || "text/plain; charset=utf-8");
}

function printValidateResult(result) {
  if (result.ok) {
    console.log(`Suite is valid: ${result.absolutePath}`);
    return 0;
  }

  console.error(`Suite is invalid: ${result.absolutePath}`);
  for (const error of result.errors || []) {
    console.error(`- ${error}`);
  }
  return 1;
}

function parseCli(argv) {
  const args = [...argv];
  const options = {
    host: DEFAULT_HOST,
    port: resolvePort(process.env.PORT, DEFAULT_PORT),
    validatePath: null
  };

  while (args.length > 0) {
    const current = args.shift();
    if (current === "--port") {
      options.port = resolvePort(args.shift(), options.port);
    } else if (current === "--host") {
      options.host = args.shift() || DEFAULT_HOST;
    } else if (current === "--validate") {
      options.validatePath = args.shift() || null;
    }
  }

  return options;
}

function formatGuiUrl({ host, port }) {
  return `http://${host}:${port}`;
}

function createRequestHandler({ host, port }) {
  return async (request, response) => {
    const url = new URL(request.url, `http://${host}:${port}`);
    try {
      if (url.pathname.startsWith("/api/")) {
        await handleApi(request, response, url, port);
        return;
      }
      serveStatic(response, url.pathname);
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        errors: [error.message]
      });
      logStatus(`Server error: ${error.message}`);
    }
  };
}

function buildPortInUseMessage({ host, port }) {
  return [
    "Command Language Casework Runner could not start.",
    `Port ${port} is already in use on ${host}.`,
    `Try: node tools/command-language-casework/server/casework-server.mjs --port ${port + 1}`,
    `Or: PORT=${port + 1} node tools/command-language-casework/server/casework-server.mjs`
  ].join("\n");
}

function startServer({ host, port }) {
  ensureToolDirs();
  const server = http.createServer(createRequestHandler({ host, port }));

  return new Promise((resolve, reject) => {
    server.once("error", (error) => {
      if (error?.code === "EADDRINUSE") {
        console.error(buildPortInUseMessage({ host, port }));
        reject(Object.assign(new Error(`Port ${port} is already in use.`), { code: "EADDRINUSE" }));
        return;
      }

      console.error(`Command Language Casework Runner failed to start: ${error.message}`);
      reject(error);
    });

    server.listen(port, host, () => {
      const address = server.address();
      const actualPort = typeof address === "object" && address ? address.port : port;
      logStatus("Command Language Casework Runner");
      logStatus(`GUI: ${formatGuiUrl({ host, port: actualPort })}`);
      logStatus("Open the GUI, paste a suite, install the runner in a disposable ChatGPT test chat, then click Run.");
      resolve({
        server,
        host,
        port: actualPort,
        guiUrl: formatGuiUrl({ host, port: actualPort })
      });
    });
  });
}

async function main(argv = process.argv.slice(2)) {
  const options = parseCli(argv);

  if (options.validatePath) {
    process.exitCode = printValidateResult(loadSuiteFromFile(options.validatePath));
    return;
  }

  try {
    await startServer(options);
  } catch (error) {
    process.exitCode = error?.code === "EADDRINUSE" ? 1 : 1;
  }
}

if (process.argv[1] === __filename) {
  main();
}

export {
  INDEX_HTML_PATH,
  buildPortInUseMessage,
  createRequestHandler,
  formatGuiUrl,
  main,
  parseCli,
  resolvePort,
  startServer
};
