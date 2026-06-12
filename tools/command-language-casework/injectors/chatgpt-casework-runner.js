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

  function createOverlay(documentRef, onStop) {
    const existing = documentRef.getElementById?.(OVERLAY_ID);
    if (existing) {
      return {
        node: existing,
        setStatus(text) {
          const target = existing.querySelector("[data-casework-status]");
          if (target) {
            target.textContent = text;
          }
        }
      };
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
      "padding:12px 14px",
      "border-radius:12px",
      "font:12px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      "box-shadow:0 14px 36px rgba(0,0,0,0.25)",
      "max-width:280px"
    ].join(";"));

    const status = documentRef.createElement("div");
    status.setAttribute("data-casework-status", "true");
    status.textContent = "Casework runner ready.";

    const button = documentRef.createElement("button");
    button.type = "button";
    button.textContent = "STOP";
    button.setAttribute("style", [
      "margin-top:8px",
      "border:0",
      "border-radius:999px",
      "padding:8px 10px",
      "background:#d95d39",
      "color:#fff",
      "cursor:pointer"
    ].join(";"));
    button.addEventListener("click", () => onStop?.("overlay_stop"));

    node.appendChild(status);
    node.appendChild(button);
    (documentRef.body || documentRef.documentElement).appendChild(node);

    return {
      node,
      setStatus(text) {
        status.textContent = text;
      }
    };
  }

  function isAllowedPage(locationRef) {
    const hostname = String(locationRef?.hostname || "");
    return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com") || hostname === "chat.openai.com";
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

    return nodes
      .map((node) => cleanText(node.textContent || ""))
      .filter(Boolean);
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

  async function runCase(documentRef, serverBaseUrl, run, caseDef, overlay, stopState) {
    const caseResult = buildCaseResult(caseDef);
    const runConfig = run.suite.run_config || {};

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

    overlay.setStatus(`Running ${caseDef.case_id}`);
    await sendJson(serverBaseUrl, "/api/runner/progress", {
      run_id: run.run_id,
      case_id: caseDef.case_id,
      status: "started",
      message: `Running ${caseDef.case_id}`
    });

    await sendAndCapture(caseDef.packet, "packet");

    for (const reply of caseDef.scripted_user_replies || []) {
      caseResult.scripted_user_replies_sent.push(reply);
      await sendAndCapture(reply, "user");
    }

    await sendJson(serverBaseUrl, "/api/runner/progress", {
      run_id: run.run_id,
      case_id: caseDef.case_id,
      status: "completed",
      message: `Completed ${caseDef.case_id}`
    });

    return caseResult;
  }

  function createRunner(options = {}) {
    const documentRef = options.documentRef || root.document;
    const locationRef = options.locationRef || root.location;
    const serverBaseUrl = options.serverBaseUrl || DEFAULT_SERVER_BASE_URL;
    const runnerId = `casework-${Math.random().toString(36).slice(2, 10)}`;
    const stopState = {
      stopRequested: false
    };
    const overlay = createOverlay(documentRef, async () => {
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
      if (!isAllowedPage(locationRef)) {
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
      if (!isAllowedPage(locationRef) || activeRunId) {
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

        const runResult = {
          suite_id: payload.run.suite.suite_id,
          run_id: payload.run.run_id,
          started_at: nowIso(),
          completed_at: null,
          browser_context_note: "Real ChatGPT page with local console-injected runner.",
          tool_version: TOOL_VERSION,
          cases: [],
          warnings: [],
          errors: []
        };

        for (const caseDef of payload.run.suite.cases) {
          if (stopState.stopRequested) {
            runResult.warnings.push("Run stopped by user before all cases completed.");
            break;
          }

          try {
            const caseResult = await runCase(documentRef, serverBaseUrl, payload.run, caseDef, overlay, stopState);
            runResult.cases.push(caseResult);
          } catch (error) {
            runResult.errors.push(`${caseDef.case_id}: ${error.message}`);
            runResult.cases.push({
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
              notes: error.message,
              raw_turn_log: []
            });
            if (payload.run.suite.run_config?.stop_on_case_failure) {
              break;
            }
          }

          if (payload.run.suite.run_config?.stop_after_each_case) {
            runResult.warnings.push("Run stopped after one case because stop_after_each_case is true.");
            break;
          }
        }

        runResult.completed_at = nowIso();
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
      overlay.setStatus("Casework runner ready. Waiting for Run.");
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
    const runner = createRunner(options);
    runner.start();
    return runner;
  }

  return {
    install
  };
});
