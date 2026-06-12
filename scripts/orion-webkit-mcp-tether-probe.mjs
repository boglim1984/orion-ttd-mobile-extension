import process from "node:process";

const DEFAULT_ENDPOINTS = [
  "http://127.0.0.1:9221/json",
  "http://127.0.0.1:9222/json"
];

function printHelp() {
  console.log(`Usage: node scripts/orion-webkit-mcp-tether-probe.mjs [--help]

Low-noise WebKit tether probe for Orion iPhone / ChatGPT targets.

What it does:
- checks localhost:9221/json
- checks localhost:9222/json
- lists pages if available
- highlights pages whose URL or title suggests ChatGPT
- prints candidate websocket URLs and the next manual targeted eval step

What it does not do:
- no storage access
- no DOM dumps
- no screenshots
- no auto-submit
`);
}

async function probeEndpoint(url) {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      return {
        url,
        ok: false,
        status: response.status,
        error: `HTTP ${response.status}`
      };
    }

    const json = await response.json();
    const pages = Array.isArray(json) ? json : [];
    return {
      url,
      ok: true,
      pageCount: pages.length,
      pages
    };
  } catch (error) {
    return {
      url,
      ok: false,
      error: error.message
    };
  }
}

function summarizePage(page) {
  const title = page.title || "(no title)";
  const pageUrl = page.url || "(no url)";
  const ws = page.webSocketDebuggerUrl || page.webSocketDebuggerUrl?.value || null;
  const isChatGpt = /chatgpt\.com|chat\.openai\.com/i.test(`${title} ${pageUrl}`);
  return {
    title,
    url: pageUrl,
    webSocketDebuggerUrl: ws,
    isChatGpt
  };
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  const results = [];
  for (const endpoint of DEFAULT_ENDPOINTS) {
    results.push(await probeEndpoint(endpoint));
  }

  console.log("# Orion WebKit MCP Tether Probe");
  console.log("");

  let totalChatGptCandidates = 0;

  for (const result of results) {
    console.log(`Endpoint: ${result.url}`);
    if (!result.ok) {
      console.log(`  status: unavailable`);
      console.log(`  detail: ${result.error || "unknown error"}`);
      console.log("");
      continue;
    }

    console.log(`  status: ok`);
    console.log(`  pages: ${result.pageCount}`);

    if (!result.pageCount) {
      console.log("  detail: no pages reported");
      console.log("");
      continue;
    }

    result.pages.map(summarizePage).forEach((page, index) => {
      const marker = page.isChatGpt ? "*" : "-";
      if (page.isChatGpt) {
        totalChatGptCandidates += 1;
      }
      console.log(`  ${marker} [${index}] ${page.title}`);
      console.log(`      url: ${page.url}`);
      if (page.webSocketDebuggerUrl) {
        console.log(`      websocket: ${page.webSocketDebuggerUrl}`);
      }
    });

    console.log("");
  }

  if (totalChatGptCandidates === 0) {
    console.log("No ChatGPT candidate pages detected.");
    console.log("Next manual step: tether iPhone, open Orion to ChatGPT, start ios_webkit_debug_proxy, then re-run this probe.");
    return;
  }

  console.log(`ChatGPT candidate pages detected: ${totalChatGptCandidates}`);
  console.log("Next manual step: use the candidate websocket target with a narrow MCP/WebKit client and run only these evals:");
  console.log("- document.documentElement.dataset.orionTtdBuild");
  console.log("- document.documentElement.dataset.orionTtdLoaded");
  console.log("- document.documentElement.dataset.orionTtdInsertOnlyReady");
  console.log("- document.dispatchEvent(new CustomEvent(\"orion-ttd-run-insert-only-smoke\"))");
  console.log("- document.documentElement.dataset.orionTtdInsertOnlyLastResult");
}

await main();
