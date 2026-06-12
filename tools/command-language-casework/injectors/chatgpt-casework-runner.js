(function initCommandLanguageCaseworkRunner(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.OrionCommandLanguageCaseworkRunner = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function caseworkRunnerFactory(root) {
  const DEFAULT_SERVER_BASE_URL = "http://127.0.0.1:4317";
  const POLL_INTERVAL_MS = 1500;
  const HEARTBEAT_INTERVAL_MS = 3000;
  const OVERLAY_ID = "orion-command-language-casework-overlay";
  const TOOL_VERSION = "command-language-casework-runner-v1";

  function nowIso() {
    return new Date().toISOString();
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function safeJsonParse(text) {
    try {
      return JSON.parse(text);
    } catch (_error) {
      return null;
    }
  }

  function isAllowedChatGptPage(locationRef) {
    const hostname = String(locationRef?.hostname || "");
    return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com") || hostname === "chat.openai.com";
  }

  function createOverlay(documentRef, options = {}) {
    const existing = documentRef.getElementById?.(OVERLAY_ID);
    if (existing) {
      existing.remove?.();
    }

    const node = documentRef.createElement("div");
    node.id = OVERLAY_ID;
    node.setAttribute("style", [
      "position:fixed",
      "right:12px",
      "bottom:12px",
      "z-index:2147483647",
      "background:#111",
      "color:#fff",
      "padding:14px",
      "border-radius:14px",
      "font:12px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      "box-shadow:0 14px 36px rgba(0,0,0,0.25)",
      "max-width:340px",
      "width:340px"
    ].join(";"));

    const title = documentRef.createElement("div");
    title.textContent = "Command Language Casework Runner";
    title.setAttribute("style", "font-weight:700;margin-bottom:6px;");

    const meta = documentRef.createElement("div");
    meta.setAttribute("data-casework-meta", "true");
    meta.setAttribute("style", "opacity:0.88;margin-bottom:8px;");
    meta.textContent = options.metaText || "No suite loaded.";

    const warning = documentRef.createElement("div");
    warning.setAttribute("data-casework-warning", "true");
    warning.setAttribute("style", "color:#f5c173;margin-bottom:10px;");
    warning.textContent =
      options.warningText ||
      "This sends scripted messages in the visible test chat after you click Run.";

    const status = documentRef.createElement("div");
    status.setAttribute("data-casework-status", "true");
    status.setAttribute("style", "white-space:pre-wrap;margin-bottom:10px;");
    status.textContent = options.statusText || "Ready.";

    const buttonRow = documentRef.createElement("div");
    buttonRow.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;");

    const runButton = documentRef.createElement("button");
    runButton.type = "button";
    runButton.textContent = "Run";
    runButton.setAttribute("style", [
      "border:0",
      "border-radius:999px",
      "padding:8px 12px",
      "background:#1f6f5f",
      "color:#fff",
      "cursor:pointer"
    ].join(";"));

    const stopButton = documentRef.createElement("button");
    stopButton.type = "button";
    stopButton.textContent = "Stop";
    stopButton.setAttribute("style", [
      "border:0",
      "border-radius:999px",
      "padding:8px 12px",
      "background:#d95d39",
      "color:#fff",
      "cursor:pointer"
    ].join(";"));

    buttonRow.appendChild(runButton);
    buttonRow.appendChild(stopButton);

    node.appendChild(title);
    node.appendChild(meta);
    node.appendChild(warning);
    node.appendChild(status);
    node.appendChild(buttonRow);
    (documentRef.body || documentRef.documentElement).appendChild(node);

    return {
      node,
      runButton,
      stopButton,
      setStatus(text) {
        status.textContent = text;
      },
      setMeta(text) {
        meta.textContent = text;
      },
      setWarning(text) {
        warning.textContent = text;
      },
      setRunDisabled(disabled) {
        runButton.disabled = Boolean(disabled);
        runButton.style.opacity = disabled ? "0.55" : "1";
        runButton.style.cursor = disabled ? "default" : "pointer";
      }
    };
  }

  function buildFetchOptions(method, payload) {
    const options = {
      method,
      mode: "cors",
      headers: {}
    };

    if (payload !== undefined) {
      options.headers["content-type"] = "application/json";
      options.body = JSON.stringify(payload);
    }

    return options;
  }

  async function sendJson(serverBaseUrl, pathname, payload, method = "POST") {
    const response = await root.fetch(`${serverBaseUrl}${pathname}`, buildFetchOptions(method, payload));
    return response.json();
  }

  const COMPOSER_SELECTORS = [
    "#prompt-textarea",
    "textarea[data-id='root']",
    "div[contenteditable='true'][id='prompt-textarea']",
    "div[contenteditable='true'][data-testid='prompt-textarea']",
    "div.ProseMirror[contenteditable='true']",
    "div[contenteditable='true'][role='textbox']"
  ];

  const SEND_SELECTORS = [
    "button[data-testid='send-button']",
    "button[aria-label='Send message']",
    "button[aria-label='Send prompt']",
    "button[aria-label*='Send']"
  ];

  const ASSISTANT_SELECTORS = [
    "[data-message-author-role='assistant']",
    "article [data-message-author-role='assistant']"
  ];

  function isVisible(element) {
    if (!element) {
      return false;
    }
    const style = root.getComputedStyle ? root.getComputedStyle(element) : null;
    return style ? style.display !== "none" && style.visibility !== "hidden" : true;
  }

  function findComposer(documentRef) {
    for (const selector of COMPOSER_SELECTORS) {
      const node = documentRef.querySelector(selector);
      if (!node || !isVisible(node) || node.disabled || node.readOnly) {
        continue;
      }
      if (typeof node.value === "string") {
        return node;
      }
      if (node.isContentEditable || node.getAttribute?.("contenteditable") === "true") {
        return node;
      }
    }
    return null;
  }

  function findSendButton(documentRef) {
    for (const selector of SEND_SELECTORS) {
      const node = documentRef.querySelector(selector);
      if (node && isVisible(node) && !node.disabled) {
        return node;
      }
    }
    return null;
  }

  function createEventFactory(documentRef) {
    const view = documentRef.defaultView || root;
    return {
      input(type, value) {
        if (typeof view.InputEvent === "function") {
          return new view.InputEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            data: value,
            inputType: "insertText"
          });
        }
        return new view.Event(type, {
          bubbles: true,
          cancelable: true,
          composed: true
        });
      },
      change() {
        return new view.Event("change", {
          bubbles: true,
          cancelable: true,
          composed: true
        });
      }
    };
  }

  function setComposerText(composer, text) {
    if (typeof composer.value === "string") {
      composer.value = text;
      composer.setSelectionRange?.(text.length, text.length);
      return "textarea";
    }

    composer.textContent = text;
    return "contenteditable";
  }

  function dispatchComposerEvents(composer, text, documentRef) {
    const events = createEventFactory(documentRef);
    composer.dispatchEvent(events.input("beforeinput", text));
    composer.dispatchEvent(events.input("input", text));
    composer.dispatchEvent(events.change());
  }

  function getComposerText(composer) {
    if (!composer) {
      return "";
    }
    return typeof composer.value === "string" ? composer.value : composer.textContent || "";
  }

  async function wait(ms) {
    await new Promise((resolve) => root.setTimeout(resolve, ms));
  }

  function collectAssistantMessages(documentRef) {
    const nodes = [];
    for (const selector of ASSISTANT_SELECTORS) {
      documentRef.querySelectorAll(selector).forEach((node) => {
        if (isVisible(node)) {
          nodes.push(node);
        }
      });
      if (nodes.length > 0) {
        break;
      }
    }

    return nodes.map((node) => cleanText(node.textContent || "")).filter(Boolean);
  }

  async function waitForStableAssistantMessage(documentRef, baseline, runConfig, stopState) {
    const timeoutMs = Number(runConfig.turn_timeout_ms || 90000);
    const stabilityWaitMs = Number(runConfig.stability_wait_ms || 2500);
    const start = Date.now();
    let stableSince = null;
    let lastText = "";

    while (Date.now() - start < timeoutMs) {
      if (stopState.stopRequested) {
        throw new Error("Runner stop requested.");
      }

      const messages = collectAssistantMessages(documentRef);
      const newest = messages[messages.length - 1] || "";
      const hasNewTurn = messages.length > baseline.count || newest !== baseline.lastText;

      if (hasNewTurn && newest) {
        if (newest !== lastText) {
          lastText = newest;
          stableSince = Date.now();
        } else if (stableSince && Date.now() - stableSince >= stabilityWaitMs) {
          return {
            latestText: newest,
            allMessages: messages
          };
        }
      }

      await wait(500);
    }

    throw new Error("Timed out waiting for assistant response stability.");
  }

  async function sendMessage(documentRef, text, stopState) {
    if (stopState.stopRequested) {
      throw new Error("Runner stop requested before send.");
    }

    const composer = findComposer(documentRef);
    if (!composer) {
      throw new Error("ChatGPT composer not found.");
    }

    composer.focus?.();
    setComposerText(composer, text);
    dispatchComposerEvents(composer, text, documentRef);

    if (!cleanText(getComposerText(composer))) {
      throw new Error("Composer text verification failed.");
    }

    const sendButton = findSendButton(documentRef);
    if (!sendButton) {
      throw new Error("Visible send button not found.");
    }

    sendButton.click();
  }

  function createBaseline(documentRef) {
    const messages = collectAssistantMessages(documentRef);
    return {
      count: messages.length,
      lastText: messages[messages.length - 1] || ""
    };
  }

  function buildCaseResult(caseDef) {
    return {
      case_id: caseDef.case_id,
      title: caseDef.title,
      research_question: caseDef.research_question,
      language_feature: caseDef.language_feature || "",
      packet_sent: caseDef.packet,
      scripted_user_replies_sent: [],
      assistant_responses: [],
      visible_turn_text: "",
      observed_chunks_or_keywords: [],
      expected_behavior: caseDef.expected_behavior || [],
      forbidden_behavior: caseDef.forbidden_behavior || [],
      notes: caseDef.notes || "",
      raw_turn_log: []
    };
  }

  function buildEmptyCaseFailure(caseDef, message) {
    return {
      case_id: caseDef.case_id,
      title: caseDef.title,
      research_question: caseDef.research_question,
      language_feature: caseDef.language_feature || "",
      packet_sent: caseDef.packet,
      scripted_user_replies_sent: [],
      assistant_responses: [],
      visible_turn_text: "",
      observed_chunks_or_keywords: [],
      expected_behavior: caseDef.expected_behavior || [],
      forbidden_behavior: caseDef.forbidden_behavior || [],
      notes: message,
      raw_turn_log: []
    };
  }

  function deriveObservedKeywords(caseResult) {
    const combined = cleanText(caseResult.assistant_responses.join(" ")).toLowerCase();
    const packetJson = safeJsonParse(String(caseResult.packet_sent || "").slice(String(caseResult.packet_sent || "").indexOf("{")));
    const candidates = [
      packetJson?.active_chunk_id,
      packetJson?.active_chunk_label,
      "clear trash",
      "collect dishes",
      "stack papers",
      "pause",
      "continue",
      "done",
      "move_on",
      "next"
    ];
    return [...new Set(candidates.filter((item) => item && combined.includes(cleanText(item).toLowerCase())))];
  }

  function heuristicClassify(caseResult) {
    const combined = cleanText(caseResult.assistant_responses.join(" ")).toLowerCase();
    const replies = caseResult.scripted_user_replies_sent.map((value) => cleanText(value).toLowerCase());

    if (
      ["milestone 7", "transport", "insert only", "packet arrived", "composer"].some((token) =>
        combined.includes(token)
      ) &&
      !combined.includes("clear trash") &&
      !combined.includes("collect dishes")
    ) {
      return "FAIL_NO_ROUTE_ENGAGEMENT";
    }

    if (!replies.includes("move_on") && !replies.includes("next") && combined.includes("collect dishes")) {
      return "FAIL_ADVANCED_WITHOUT_PERMISSION";
    }

    if (!replies.includes("done") && combined.includes("clear trash is complete")) {
      return "FAIL_INVENTED_PROGRESS";
    }

    if (replies.length > 0 && !combined.includes("clear trash") && !combined.includes("collect dishes")) {
      return "FAIL_LOST_ROUTE";
    }

    return "PASS_CANDIDATE";
  }

  function finalizeRunResult(runResult) {
    runResult.cases = runResult.cases.map((caseResult) => {
      const observedKeywords = deriveObservedKeywords(caseResult);
      return {
        ...caseResult,
        observed_chunks_or_keywords: observedKeywords,
        heuristic_classification: heuristicClassify(caseResult)
      };
    });
    return runResult;
  }

  function buildSummaryMarkdown(runResult) {
    const lines = [
      "# Command Language Casework Run Summary",
      "",
      `- suite_id: ${runResult.suite_id}`,
      `- run_id: ${runResult.run_id}`,
      `- started_at: ${runResult.started_at}`,
      `- completed_at: ${runResult.completed_at}`,
      ""
    ];

    runResult.cases.forEach((caseResult) => {
      lines.push(`## ${caseResult.case_id}`, "");
      lines.push(`- heuristic classification: ${caseResult.heuristic_classification}`);
      lines.push(`- visible turn text: ${caseResult.visible_turn_text || "none"}`);
      lines.push(`- observed chunks or keywords: ${(caseResult.observed_chunks_or_keywords || []).join(", ") || "none"}`);
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

  function triggerDownload(filename, text, mimeType, documentRef) {
    const blob = new root.Blob([text], {
      type: mimeType
    });
    const objectUrl = root.URL.createObjectURL(blob);
    const anchor = documentRef.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    (documentRef.body || documentRef.documentElement).appendChild(anchor);
    anchor.click();
    anchor.remove?.();
    root.setTimeout(() => root.URL.revokeObjectURL(objectUrl), 1000);
  }

  async function bestEffortUploadResult(serverBaseUrl, suite, runResult) {
    if (!serverBaseUrl || typeof root.fetch !== "function") {
      return {
        ok: false,
        blocked: true,
        message: "No upload target configured."
      };
    }

    try {
      const response = await sendJson(serverBaseUrl, "/api/runner/self-contained-result", {
        suite,
        runResult
      });
      return {
        ok: Boolean(response?.ok),
        blocked: !response?.ok,
        message: response?.ok ? "Local result upload succeeded." : "Local result upload was rejected."
      };
    } catch (error) {
      return {
        ok: false,
        blocked: true,
        message: `Local result upload was blocked by ChatGPT CSP. Downloaded result file instead. (${error.message})`
      };
    }
  }

  async function executeCase(documentRef, caseDef, runConfig, stopState) {
    const caseResult = buildCaseResult(caseDef);

    async function sendAndCapture(actorText, actor) {
      const baseline = createBaseline(documentRef);
      caseResult.raw_turn_log.push({
        at: nowIso(),
        actor,
        text: actorText
      });
      await sendMessage(documentRef, actorText, stopState);
      const observation = await waitForStableAssistantMessage(documentRef, baseline, runConfig, stopState);
      const latestText = observation.latestText;
      caseResult.assistant_responses.push(latestText);
      caseResult.visible_turn_text = latestText;
      caseResult.raw_turn_log.push({
        at: nowIso(),
        actor: "assistant",
        text: latestText
      });
    }

    await sendAndCapture(caseDef.packet, "packet");

    for (const reply of caseDef.scripted_user_replies || []) {
      caseResult.scripted_user_replies_sent.push(reply);
      await sendAndCapture(reply, "user");
    }

    return caseResult;
  }

  async function runSuiteLocally({ documentRef, suite, runId, stopState, overlay, browserContextNote }) {
    const runResult = {
      suite_id: suite.suite_id,
      run_id: runId,
      started_at: nowIso(),
      completed_at: null,
      browser_context_note: browserContextNote,
      tool_version: TOOL_VERSION,
      cases: [],
      warnings: [],
      errors: []
    };

    const runConfig = suite.run_config || {};
    for (const caseDef of suite.cases || []) {
      if (stopState.stopRequested) {
        runResult.warnings.push("Run stopped by user before all cases completed.");
        break;
      }

      overlay.setStatus(`Running ${caseDef.case_id}`);
      try {
        const caseResult = await executeCase(documentRef, caseDef, runConfig, stopState);
        runResult.cases.push(caseResult);
      } catch (error) {
        runResult.errors.push(`${caseDef.case_id}: ${error.message}`);
        runResult.cases.push(buildEmptyCaseFailure(caseDef, error.message));
        if (runConfig.stop_on_case_failure) {
          break;
        }
      }

      if (runConfig.stop_after_each_case) {
        runResult.warnings.push("Run stopped after one case because stop_after_each_case is true.");
        break;
      }
    }

    runResult.completed_at = nowIso();
    return finalizeRunResult(runResult);
  }

  async function runSelfContainedSuite(options = {}) {
    const documentRef = options.documentRef || root.document;
    const locationRef = options.locationRef || root.location;
    const overlay = options.overlay;
    const stopState = options.stopState || { stopRequested: false };
    const suite = options.suite;
    const runId = options.runId;
    const serverBaseUrl = options.serverBaseUrl || null;

    if (!isAllowedChatGptPage(locationRef)) {
      throw new Error("This runner must be used on a visible ChatGPT test chat for live execution.");
    }

    overlay.setRunDisabled(true);
    overlay.setStatus("Running suite...");
    const runResult = await runSuiteLocally({
      documentRef,
      suite,
      runId,
      stopState,
      overlay,
      browserContextNote: "Real ChatGPT page with self-contained console payload."
    });

    const resultJson = JSON.stringify(runResult, null, 2);
    triggerDownload(`orion-casework-result-${runId}.json`, resultJson, "application/json", documentRef);

    const summaryMarkdown = buildSummaryMarkdown(runResult);
    try {
      triggerDownload(`orion-casework-summary-${runId}.md`, summaryMarkdown, "text/markdown", documentRef);
    } catch (_error) {
      runResult.warnings.push("Summary markdown download failed; JSON result still downloaded.");
    }

    const uploadOutcome = await bestEffortUploadResult(serverBaseUrl, suite, runResult);
    if (!uploadOutcome.ok) {
      runResult.warnings.push(uploadOutcome.message);
      overlay.setStatus(`Run complete.\n${uploadOutcome.message}`);
    } else {
      overlay.setStatus("Run complete. Result uploaded locally and downloaded.");
    }

    overlay.setRunDisabled(false);
    return runResult;
  }

  function createServerRunner(options = {}) {
    const documentRef = options.documentRef || root.document;
    const locationRef = options.locationRef || root.location;
    const serverBaseUrl = options.serverBaseUrl || DEFAULT_SERVER_BASE_URL;
    const runnerId = `casework-${Math.random().toString(36).slice(2, 10)}`;
    const stopState = {
      stopRequested: false
    };
    const overlay = createOverlay(documentRef, {
      metaText: "Legacy server-assisted mode",
      statusText: "Casework runner ready. Waiting for server-side Run.",
      warningText: "Legacy mode. This path may be blocked by ChatGPT CSP."
    });

    overlay.runButton.style.display = "none";
    overlay.stopButton.addEventListener("click", async () => {
      stopState.stopRequested = true;
      overlay.setStatus("Stop requested.");
      try {
        await sendJson(serverBaseUrl, "/api/stop", {
          source: "page_overlay"
        });
      } catch (_error) {
        overlay.setStatus("Stop requested. Server did not confirm.");
      }
    });

    let activeRunId = null;

    async function heartbeat() {
      if (!isAllowedChatGptPage(locationRef)) {
        overlay.setStatus("Runner disabled: not a ChatGPT page.");
        return;
      }

      try {
        const response = await sendJson(serverBaseUrl, "/api/runner/heartbeat", {
          runner_id: runnerId,
          href: locationRef?.href || "",
          title: documentRef?.title || "",
          tool_version: TOOL_VERSION
        });
        if (response.stop_requested) {
          stopState.stopRequested = true;
          overlay.setStatus("Server requested stop.");
        }
      } catch (_error) {
        overlay.setStatus("Runner heartbeat failed. Check local server.");
      }
    }

    async function pollForWork() {
      if (!isAllowedChatGptPage(locationRef) || activeRunId) {
        return;
      }

      try {
        const response = await root.fetch(
          `${serverBaseUrl}/api/runner/next?runner_id=${encodeURIComponent(runnerId)}`,
          buildFetchOptions("GET")
        );
        const payload = await response.json();
        if (!payload.ok || !payload.run) {
          return;
        }

        activeRunId = payload.run.run_id;
        stopState.stopRequested = false;
        overlay.setStatus(`Accepted run ${activeRunId}`);
        const runResult = await runSuiteLocally({
          documentRef,
          suite: payload.run.suite,
          runId: payload.run.run_id,
          stopState,
          overlay,
          browserContextNote: "Real ChatGPT page with local console-injected runner."
        });
        await sendJson(serverBaseUrl, "/api/runner/report-run", runResult);
        overlay.setStatus(`Completed run ${activeRunId}`);
      } catch (error) {
        overlay.setStatus(`Run failed: ${error.message}`);
        try {
          await sendJson(serverBaseUrl, "/api/runner/report-run", {
            suite_id: "unknown",
            run_id: activeRunId || "unknown",
            started_at: nowIso(),
            completed_at: nowIso(),
            browser_context_note: "Run failed before suite completion.",
            tool_version: TOOL_VERSION,
            cases: [],
            warnings: [],
            errors: [error.message]
          });
        } catch (_reportError) {
          overlay.setStatus("Run failed and server report also failed.");
        }
      } finally {
        activeRunId = null;
      }
    }

    function start() {
      heartbeat();
      root.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
      root.setInterval(pollForWork, POLL_INTERVAL_MS);
    }

    return {
      runnerId,
      serverBaseUrl,
      start
    };
  }

  function install(options = {}) {
    const runner = createServerRunner(options);
    runner.start();
    return runner;
  }

  function installSelfContained(options = {}) {
    const documentRef = options.documentRef || root.document;
    const locationRef = options.locationRef || root.location;
    const suite = options.suite || {
      suite_id: "unknown-suite",
      cases: []
    };
    const runId = options.runId || `self-contained-${Date.now()}`;
    const serverBaseUrl = options.serverBaseUrl || null;
    const stopState = {
      stopRequested: false
    };

    const overlay = createOverlay(documentRef, {
      metaText: `suite_id: ${suite.suite_id}\ncase_count: ${(suite.cases || []).length}`,
      statusText: isAllowedChatGptPage(locationRef)
        ? "Ready. Nothing will send until you click Run."
        : "Installed. For live execution, switch to a visible disposable ChatGPT test chat before clicking Run.",
      warningText:
        "This sends scripted messages in the visible test chat after you click Run. Use only in a disposable ChatGPT test chat."
    });

    overlay.stopButton.addEventListener("click", () => {
      stopState.stopRequested = true;
      overlay.setStatus("Stop requested.");
      overlay.setRunDisabled(false);
    });

    overlay.runButton.addEventListener("click", async () => {
      stopState.stopRequested = false;
      try {
        await runSelfContainedSuite({
          documentRef,
          locationRef,
          suite,
          runId,
          serverBaseUrl,
          overlay,
          stopState
        });
      } catch (error) {
        overlay.setRunDisabled(false);
        overlay.setStatus(`Run failed: ${error.message}`);
      }
    });

    return {
      runId,
      suiteId: suite.suite_id,
      caseCount: (suite.cases || []).length
    };
  }

  return {
    install,
    installSelfContained
  };
});
