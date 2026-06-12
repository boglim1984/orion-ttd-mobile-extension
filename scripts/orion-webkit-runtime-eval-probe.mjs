import process from "node:process";

const SAFE_EXPRESSIONS = [
  "1 + 1",
  "1+1",
  "2",
  "document.title",
  "document.readyState",
  "document.location.href",
  "document.documentElement.dataset.orionTtdBuild",
  "document.documentElement.dataset.orionTtdLoaded",
  "document.documentElement.dataset.orionTtdInsertOnlyReady"
];

const HANDSHAKE_STEPS = {
  runtime: ["Runtime.enable"],
  "inspector-runtime": ["Inspector.enable", "Runtime.enable"],
  "page-runtime": ["Page.enable", "Runtime.enable"]
};

function printHelp() {
  console.log(`Usage: node scripts/orion-webkit-runtime-eval-probe.mjs --ws <websocket-url> [options]

Low-noise WebKit protocol probe for the Orion iPhone target.

Options:
- --ws <url>                   WebSocket inspector target
- --timeout-ms <n>             Per-command timeout in milliseconds (default: 5000)
- --expression <js>            Run one safe one-off expression instead of the default ladder
- --list-expressions           Print the built-in safe expression ladder and exit
- --handshake <mode>           One of: runtime, inspector-runtime, page-runtime
- --with-page-enable           Alias for --handshake page-runtime
- --raw-log                    Print low-noise send/recv/close summary lines
- --help                       Show this help

Boundaries:
- no DOM dumps
- no storage access
- no screenshots
- no insert dispatch
- no auto-submit
`);
}

function parseArgs(argv) {
  const options = {
    ws: "",
    timeoutMs: 5000,
    expression: "",
    listExpressions: false,
    handshake: "runtime",
    rawLog: false,
    help: false
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "--list-expressions") {
      options.listExpressions = true;
      continue;
    }

    if (arg === "--raw-log") {
      options.rawLog = true;
      continue;
    }

    if (arg === "--with-page-enable") {
      options.handshake = "page-runtime";
      continue;
    }

    if (arg === "--ws" && next) {
      options.ws = next;
      index += 1;
      continue;
    }

    if (arg === "--timeout-ms" && next) {
      options.timeoutMs = Number.parseInt(next, 10);
      index += 1;
      continue;
    }

    if (arg === "--expression" && next) {
      options.expression = next;
      index += 1;
      continue;
    }

    if (arg === "--handshake" && next) {
      options.handshake = next;
      index += 1;
      continue;
    }
  }

  return options;
}

function isAllowedExpression(expression) {
  return SAFE_EXPRESSIONS.includes(expression);
}

function summarizeValue(value) {
  if (value === undefined) {
    return "(undefined)";
  }

  if (typeof value === "string") {
    return JSON.stringify(value.length > 160 ? `${value.slice(0, 157)}...` : value);
  }

  return JSON.stringify(value);
}

function summarizeError(error) {
  if (!error) {
    return "(unknown)";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error.code !== "undefined" || typeof error.message !== "undefined") {
    return JSON.stringify({
      code: error.code,
      message: error.message
    });
  }

  return JSON.stringify(error);
}

async function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    printHelp();
    return;
  }

  if (options.listExpressions) {
    console.log("# Safe Expressions");
    console.log("");
    SAFE_EXPRESSIONS.forEach((expression) => console.log(`- ${expression}`));
    return;
  }

  if (!options.ws) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    console.error("Invalid --timeout-ms value.");
    process.exitCode = 1;
    return;
  }

  if (!HANDSHAKE_STEPS[options.handshake]) {
    console.error("Invalid --handshake value.");
    process.exitCode = 1;
    return;
  }

  if (typeof WebSocket !== "function") {
    console.error("Global WebSocket is not available in this Node runtime.");
    process.exitCode = 1;
    return;
  }

  const expressions = options.expression ? [options.expression] : SAFE_EXPRESSIONS.filter((expression) => expression !== "1 + 1");
  if (options.expression && !isAllowedExpression(options.expression)) {
    console.error("Expression is outside the approved safe ladder.");
    process.exitCode = 1;
    return;
  }

  const handshakeSteps = HANDSHAKE_STEPS[options.handshake];
  const eventMethods = new Map();
  const pending = new Map();
  const rawLines = [];
  const timedOutIds = [];
  let nextId = 1;
  let closed = false;
  let closeInfo = { code: null, reason: "" };

  function pushRaw(line) {
    if (options.rawLog) {
      rawLines.push(line);
    }
  }

  const socket = new WebSocket(options.ws);
  const openPromise = new Promise((resolve, reject) => {
    const openTimer = setTimeout(() => reject(new Error("WebSocket open timeout")), options.timeoutMs);
    socket.addEventListener("open", () => {
      clearTimeout(openTimer);
      pushRaw("socket open");
      resolve();
    }, { once: true });
    socket.addEventListener("error", () => {
      clearTimeout(openTimer);
      reject(new Error("WebSocket connection error"));
    }, { once: true });
  });

  socket.addEventListener("close", (event) => {
    closed = true;
    closeInfo = { code: event.code, reason: event.reason || "" };
    pushRaw(`socket close code=${event.code} reason=${event.reason || "(empty)"}`);
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer);
      entry.resolve({
        id,
        ok: false,
        timeout: false,
        error: "socket closed before response"
      });
    }
    pending.clear();
  });

  socket.addEventListener("message", (event) => {
    let payload;
    try {
      payload = JSON.parse(String(event.data));
    } catch {
      return;
    }

    if (typeof payload.id !== "undefined" && pending.has(payload.id)) {
      const entry = pending.get(payload.id);
      pending.delete(payload.id);
      clearTimeout(entry.timer);
      pushRaw(`recv id=${payload.id}${payload.error ? ` error=${summarizeError(payload.error)}` : " ok"}`);
      entry.resolve({
        id: payload.id,
        ok: !payload.error,
        timeout: false,
        response: payload,
        error: payload.error || null
      });
      return;
    }

    if (payload.method) {
      const count = eventMethods.get(payload.method) || 0;
      eventMethods.set(payload.method, count + 1);
      pushRaw(`event method=${payload.method}`);
    }
  });

  function sendCommand(method, params = {}) {
    if (closed) {
      return Promise.resolve({
        id: null,
        ok: false,
        timeout: false,
        error: "socket already closed"
      });
    }

    const id = nextId;
    nextId += 1;
    pushRaw(`send id=${id} method=${method}`);

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        timedOutIds.push(id);
        pushRaw(`timeout id=${id} method=${method}`);
        resolve({
          id,
          ok: false,
          timeout: true,
          error: `timeout after ${options.timeoutMs}ms`
        });
      }, options.timeoutMs);

      pending.set(id, { resolve, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  console.log("# Orion WebKit Runtime Eval Probe");
  console.log("");
  console.log(`WebSocket: ${options.ws}`);
  console.log(`Timeout: ${options.timeoutMs}ms`);
  console.log(`Handshake: ${options.handshake}`);
  console.log(`Expression count: ${expressions.length}`);
  console.log("");

  try {
    await openPromise;
  } catch (error) {
    console.log("Connection: failed");
    console.log(`Detail: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log("Connection: open");
  console.log("");

  const commandResults = [];

  for (const method of handshakeSteps) {
    commandResults.push({
      label: method,
      result: await sendCommand(method)
    });
  }

  for (const expression of expressions) {
    commandResults.push({
      label: `Runtime.evaluate ${expression}`,
      result: await sendCommand("Runtime.evaluate", {
        expression,
        returnByValue: true
      })
    });
  }

  for (const entry of commandResults) {
    console.log(`Command: ${entry.label}`);

    if (entry.result.timeout) {
      console.log("  status: timeout");
      console.log(`  detail: ${entry.result.error}`);
      continue;
    }

    if (!entry.result.ok) {
      console.log("  status: error");
      console.log(`  detail: ${summarizeError(entry.result.error)}`);
      continue;
    }

    if (entry.label.startsWith("Runtime.evaluate")) {
      const value = entry.result.response?.result?.result?.value;
      const type = entry.result.response?.result?.result?.type || "(unknown)";
      console.log("  status: ok");
      console.log(`  type: ${type}`);
      console.log(`  value: ${summarizeValue(value)}`);
      continue;
    }

    console.log("  status: ok");
  }

  console.log("");
  console.log("Events observed:");
  if (eventMethods.size === 0) {
    console.log("  none");
  } else {
    for (const [method, count] of eventMethods) {
      console.log(`  - ${method}: ${count}`);
    }
  }

  console.log("");
  console.log("Timed out ids:");
  if (timedOutIds.length === 0) {
    console.log("  none");
  } else {
    console.log(`  ${timedOutIds.join(", ")}`);
  }

  if (!closed) {
    socket.close();
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log("");
  console.log("Socket close:");
  console.log(`  code: ${closeInfo.code ?? "(none)"}`);
  console.log(`  reason: ${closeInfo.reason || "(empty)"}`);

  if (options.rawLog) {
    console.log("");
    console.log("Raw summary:");
    if (rawLines.length === 0) {
      console.log("  none");
    } else {
      rawLines.forEach((line) => console.log(`  - ${line}`));
    }
  }
}

await main();
