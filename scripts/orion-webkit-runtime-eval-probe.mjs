import process from "node:process";

const SAFE_EXPRESSIONS = [
  "1 + 1",
  "document.title",
  "document.readyState",
  "document.location.href",
  "document.documentElement.dataset.orionTtdBuild",
  "document.documentElement.dataset.orionTtdLoaded",
  "document.documentElement.dataset.orionTtdInsertOnlyReady"
];

function printHelp() {
  console.log(`Usage: node scripts/orion-webkit-runtime-eval-probe.mjs --ws <websocket-url> [options]

Low-noise WebKit Runtime.evaluate isolation probe for the Orion iPhone target.

Options:
- --ws <url>                 WebSocket inspector target
- --timeout-ms <n>           Per-command timeout in milliseconds (default: 5000)
- --expression <js>          Run one safe one-off expression instead of the default ladder
- --list-expressions         Print the built-in safe expression ladder and exit
- --with-page-enable         Send Page.enable before Runtime.enable/evaluate
- --help                     Show this help

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
    withPageEnable: false,
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

    if (arg === "--with-page-enable") {
      options.withPageEnable = true;
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

  if (typeof WebSocket !== "function") {
    console.error("Global WebSocket is not available in this Node runtime.");
    process.exitCode = 1;
    return;
  }

  const expressions = options.expression ? [options.expression] : SAFE_EXPRESSIONS;
  if (options.expression && !isAllowedExpression(options.expression)) {
    console.error("Expression is outside the approved safe ladder.");
    process.exitCode = 1;
    return;
  }

  const eventMethods = new Map();
  const pending = new Map();
  let nextId = 1;
  let closed = false;

  const socket = new WebSocket(options.ws);
  const openPromise = new Promise((resolve, reject) => {
    const openTimer = setTimeout(() => reject(new Error("WebSocket open timeout")), options.timeoutMs);
    socket.addEventListener("open", () => {
      clearTimeout(openTimer);
      resolve();
    }, { once: true });
    socket.addEventListener("error", () => {
      clearTimeout(openTimer);
      reject(new Error("WebSocket connection error"));
    }, { once: true });
  });

  socket.addEventListener("close", () => {
    closed = true;
    for (const [, entry] of pending) {
      clearTimeout(entry.timer);
      entry.resolve({
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

    if (payload.id && pending.has(payload.id)) {
      const entry = pending.get(payload.id);
      pending.delete(payload.id);
      clearTimeout(entry.timer);
      entry.resolve({
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
    }
  });

  function sendCommand(method, params = {}) {
    if (closed) {
      return Promise.resolve({
        ok: false,
        timeout: false,
        error: "socket already closed"
      });
    }

    const id = nextId;
    nextId += 1;

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve({
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
  console.log(`Page.enable: ${options.withPageEnable ? "enabled" : "disabled"}`);
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

  if (options.withPageEnable) {
    commandResults.push({
      label: "Page.enable",
      result: await sendCommand("Page.enable")
    });
  }

  commandResults.push({
    label: "Runtime.enable",
    result: await sendCommand("Runtime.enable")
  });

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
      console.log(`  status: timeout`);
      console.log(`  detail: ${entry.result.error}`);
      continue;
    }

    if (!entry.result.ok) {
      console.log(`  status: error`);
      console.log(`  detail: ${JSON.stringify(entry.result.error)}`);
      continue;
    }

    if (entry.label.startsWith("Runtime.evaluate")) {
      const value = entry.result.response?.result?.result?.value;
      const type = entry.result.response?.result?.result?.type || "(unknown)";
      console.log(`  status: ok`);
      console.log(`  type: ${type}`);
      console.log(`  value: ${summarizeValue(value)}`);
      continue;
    }

    console.log(`  status: ok`);
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

  if (!closed) {
    socket.close();
  }
}

await main();
