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
  const TOOL_FAILURE_LABELS = {
    COMPOSER_NOT_FOUND: "TOOL_FAIL_COMPOSER_NOT_FOUND",
    COMPOSER_INSERT_VERIFY: "TOOL_FAIL_COMPOSER_INSERT_VERIFY",
    COMPOSER_STATE_NOT_SYNCED: "TOOL_FAIL_COMPOSER_STATE_NOT_SYNCED",
    SEND_CONTROL_NOT_ENABLED_AFTER_INSERT: "TOOL_FAIL_SEND_CONTROL_NOT_ENABLED_AFTER_INSERT",
    SEND_BUTTON_NOT_FOUND: "TOOL_FAIL_SEND_BUTTON_NOT_FOUND",
    MESSAGE_NOT_SENT: "TOOL_FAIL_MESSAGE_NOT_SENT",
    RESPONSE_NOT_OBSERVED: "TOOL_FAIL_RESPONSE_NOT_OBSERVED",
    TURN_SEQUENCING_NO_ASSISTANT_COMPLETION: "TOOL_FAIL_TURN_SEQUENCING_NO_ASSISTANT_COMPLETION"
  };
  const STOP_GENERATION_SELECTORS = [
    "button[data-testid='stop-button']",
    "button[aria-label*='Stop answering']",
    "button[aria-label*='stop answering']"
  ];

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

    const diagnosticsTitle = documentRef.createElement("div");
    diagnosticsTitle.textContent = "Diagnostics";
    diagnosticsTitle.setAttribute("style", "font-weight:600;margin-bottom:4px;");

    const diagnostics = documentRef.createElement("pre");
    diagnostics.setAttribute("data-casework-diagnostics", "true");
    diagnostics.setAttribute("style", [
      "white-space:pre-wrap",
      "margin:0 0 10px 0",
      "padding:8px",
      "border-radius:10px",
      "background:rgba(255,255,255,0.06)",
      "max-height:180px",
      "overflow:auto"
    ].join(";"));
    diagnostics.textContent = options.diagnosticsText || "No diagnostics yet.";

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

    const copyDiagnosticsButton = documentRef.createElement("button");
    copyDiagnosticsButton.type = "button";
    copyDiagnosticsButton.textContent = "Copy Diagnostics";
    copyDiagnosticsButton.setAttribute("style", [
      "border:0",
      "border-radius:999px",
      "padding:8px 12px",
      "background:#345995",
      "color:#fff",
      "cursor:pointer"
    ].join(";"));

    buttonRow.appendChild(runButton);
    buttonRow.appendChild(stopButton);
    buttonRow.appendChild(copyDiagnosticsButton);

    node.appendChild(title);
    node.appendChild(meta);
    node.appendChild(warning);
    node.appendChild(status);
    node.appendChild(diagnosticsTitle);
    node.appendChild(diagnostics);
    node.appendChild(buttonRow);
    (documentRef.body || documentRef.documentElement).appendChild(node);

    return {
      node,
      runButton,
      stopButton,
      copyDiagnosticsButton,
      lastDiagnosticsText: diagnostics.textContent,
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
      },
      setRunLabel(text) {
        runButton.textContent = text;
      },
      setDiagnostics(text) {
        diagnostics.textContent = text || "No diagnostics yet.";
        this.lastDiagnosticsText = diagnostics.textContent;
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
    "button[data-testid='composer-send-button']",
    "button[aria-label='Send message']",
    "button[aria-label='Send prompt']",
    "button[aria-label*='Send']",
    "button[aria-label*='send']",
    "button[type='submit']",
    "form button"
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
    if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) {
      return false;
    }
    const rect = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : null;
    if (rect && rect.width === 0 && rect.height === 0) {
      return false;
    }
    return true;
  }

  function makeAttemptDiagnostics() {
    return {
      composerSelectorsChecked: [],
      composerFound: false,
      composerSelectorUsed: null,
      composerKind: "unknown",
      composerTextLength: 0,
      composerTextVerified: false,
      sendSelectorsChecked: [],
      sendCandidatesConsidered: [],
      sendButtonFound: false,
      sendButtonSelectorUsed: null,
      sendButtonDisabled: "unknown",
      sendButtonMeta: null,
      insertionMethodUsed: "none",
      eventsDispatched: [],
      stateSyncWaitMs: 0,
      sendControlAppearedAfterWait: false,
      controlsBeforeInsert: [],
      controlsAfterInsert: [],
      controlsAfterWait: [],
      failureStage: "composer_insert",
      fallbackMethodUsed: "none",
      submitAttempted: false,
      lastError: null,
      domTurnTrace: []
    };
  }

  function uniqueList(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function findComposer(documentRef, diagnostics) {
    for (const selector of COMPOSER_SELECTORS) {
      diagnostics?.composerSelectorsChecked.push(selector);
      const node = documentRef.querySelector(selector);
      if (!node || !isVisible(node) || node.disabled || node.readOnly) {
        continue;
      }
      if (typeof node.value === "string") {
        return {
          node,
          selectorUsed: selector,
          composerKind: "textarea"
        };
      }
      if (node.isContentEditable || node.getAttribute?.("contenteditable") === "true") {
        return {
          node,
          selectorUsed: selector,
          composerKind: "contenteditable"
        };
      }
    }
    return null;
  }

  function textFromElement(node) {
    return cleanText([
      node?.getAttribute?.("aria-label"),
      node?.getAttribute?.("title"),
      node?.getAttribute?.("data-testid"),
      node?.textContent
    ].join(" "));
  }

  function buildButtonMeta(node) {
    if (!node) {
      return null;
    }
    return {
      ariaLabel: node.getAttribute?.("aria-label") || "",
      title: node.getAttribute?.("title") || "",
      dataTestId: node.getAttribute?.("data-testid") || "",
      type: node.getAttribute?.("type") || "",
      text: cleanText(node.textContent || "")
    };
  }

  function describeDiagnostics(diagnostics) {
    const sendMeta = diagnostics.sendButtonMeta || {};
    return [
      `composer selector candidates checked: ${(diagnostics.composerSelectorsChecked || []).join(", ") || "none"}`,
      `composer found: ${diagnostics.composerFound ? "yes" : "no"}`,
      `composer selector used: ${diagnostics.composerSelectorUsed || "none"}`,
      `composer kind: ${diagnostics.composerKind || "unknown"}`,
      `composer text length after insert attempt: ${Number(diagnostics.composerTextLength || 0)}`,
      `composer text verified: ${diagnostics.composerTextVerified ? "yes" : "no"}`,
      `insertion method used: ${diagnostics.insertionMethodUsed || "none"}`,
      `events dispatched: ${(diagnostics.eventsDispatched || []).join(", ") || "none"}`,
      `state sync wait ms: ${Number(diagnostics.stateSyncWaitMs || 0)}`,
      `send control appeared after wait: ${diagnostics.sendControlAppearedAfterWait ? "yes" : "no"}`,
      `controls before insert: ${(diagnostics.controlsBeforeInsert || []).join(", ") || "none"}`,
      `controls after insert: ${(diagnostics.controlsAfterInsert || []).join(", ") || "none"}`,
      `controls after wait: ${(diagnostics.controlsAfterWait || []).join(", ") || "none"}`,
      `send button selector candidates checked: ${(diagnostics.sendSelectorsChecked || []).join(", ") || "none"}`,
      `send candidates considered: ${(diagnostics.sendCandidatesConsidered || []).join(", ") || "none"}`,
      `send button found: ${diagnostics.sendButtonFound ? "yes" : "no"}`,
      `send button selector used: ${diagnostics.sendButtonSelectorUsed || "none"}`,
      `send button disabled: ${diagnostics.sendButtonDisabled}`,
      `send button aria-label: ${sendMeta.ariaLabel || "none"}`,
      `send button title: ${sendMeta.title || "none"}`,
      `send button data-testid: ${sendMeta.dataTestId || "none"}`,
      `fallback method used: ${diagnostics.fallbackMethodUsed || "none"}`,
      `failure stage: ${diagnostics.failureStage || "unknown"}`,
      `dom turn trace entries: ${Array.isArray(diagnostics.domTurnTrace) ? diagnostics.domTurnTrace.length : 0}`,
      `last error: ${diagnostics.lastError || "none"}`
    ].join("\n");
  }

  function latestExcerpt(text) {
    return cleanText(String(text || "")).slice(0, 160);
  }

  function looksLikeThinking(text) {
    const normalized = cleanText(text).toLowerCase();
    return normalized === "thinking" || normalized === "thinking..." || normalized === "thinking…" || normalized.startsWith("thinking ");
  }

  function collectUserMessages(documentRef) {
    const selectors = [
      "[data-message-author-role='user']",
      "article [data-message-author-role='user']"
    ];
    const nodes = [];
    for (const selector of selectors) {
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

  function isStopButtonVisible(documentRef) {
    for (const selector of STOP_GENERATION_SELECTORS) {
      const node = documentRef.querySelector(selector);
      if (node && isVisible(node)) {
        return true;
      }
    }

    return [...documentRef.querySelectorAll("button")]
      .some((node) => isVisible(node) && /stop answering/i.test(textFromElement(node)));
  }

  function snapshotDomTurnState(documentRef, composer, diagnostics) {
    const userMessages = collectUserMessages(documentRef);
    const assistantMessages = collectAssistantMessages(documentRef);
    const latestAssistant = assistantMessages[assistantMessages.length - 1] || "";
    const latestUser = userMessages[userMessages.length - 1] || "";
    const sendButton = composer ? findSendButton(documentRef, composer, diagnostics || makeAttemptDiagnostics()) : null;
    const composerText = composer ? getComposerText(composer) : "";
    const stopVisible = isStopButtonVisible(documentRef);
    const thinkingVisible = looksLikeThinking(latestAssistant) || stopVisible;

    return {
      timestamp: nowIso(),
      user_message_count: userMessages.length,
      assistant_message_count: assistantMessages.length,
      latest_user_text_excerpt: latestExcerpt(latestUser),
      latest_assistant_text_excerpt: latestExcerpt(latestAssistant),
      thinking_visible: thinkingVisible,
      stop_button_visible: stopVisible,
      send_button_visible: Boolean(sendButton),
      composer_text_length: composer ? composerText.length : 0,
      composer_verified: composer ? (cleanText(composerText) ? true : false) : "unknown"
    };
  }

  function pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, phase, actionTaken, notes = "") {
    const snapshot = snapshotDomTurnState(documentRef, composer, diagnostics);
    const entry = {
      ...snapshot,
      phase,
      action_taken: actionTaken,
      notes
    };
    caseResult.dom_turn_trace.push(entry);
    if (diagnostics) {
      diagnostics.domTurnTrace = caseResult.dom_turn_trace;
    }
    return entry;
  }

  function collectComposerControls(composer) {
    const form = composer?.closest?.("form");
    const scope = form || composer?.parentElement || composer?.ownerDocument;
    if (!scope || typeof scope.querySelectorAll !== "function") {
      return [];
    }

    return [...scope.querySelectorAll("button")]
      .filter((node) => isVisible(node))
      .map((node) => {
        const label = textFromElement(node);
        return label || "(unlabeled button)";
      })
      .slice(0, 12);
  }

  function isAllowedSendButtonText(text) {
    const normalized = String(text || "").toLowerCase();
    if (!normalized) {
      return false;
    }
    if (/(voice|microphone|mic|upload|attach|paperclip|plus|image|photo|record|audio|dictate|canvas|tool|search|reason|stop|cancel)/.test(normalized)) {
      return false;
    }
    return /send|submit/.test(normalized);
  }

  function rankSendButtonCandidate(node, selectorUsed, composer) {
    if (!node) {
      return null;
    }
    const visible = isVisible(node);
    const disabled = typeof node.disabled === "boolean" ? node.disabled : node.getAttribute?.("aria-disabled") === "true";
    const meta = buildButtonMeta(node);
    const text = textFromElement(node);
    const sameForm = Boolean(composer?.closest?.("form") && node.closest?.("form") === composer.closest("form"));
    const nearby = Boolean(composer?.parentElement && composer.parentElement.contains?.(node));
    const hasSendLikeText = isAllowedSendButtonText(text);
    const isSubmitType = String(meta.type || "").toLowerCase() === "submit";
    let score = 0;
    if (!visible) {
      score -= 200;
    }
    if (disabled) {
      score -= 180;
    }
    if (selectorUsed === "button[data-testid='send-button']") {
      score += 120;
    }
    if (selectorUsed === "button[data-testid='composer-send-button']") {
      score += 110;
    }
    if (hasSendLikeText) {
      score += 80;
    }
    if (isSubmitType) {
      score += 35;
    }
    if (sameForm) {
      score += 25;
    }
    if (nearby) {
      score += 15;
    }
    if (!hasSendLikeText && !isSubmitType && !/send|submit/i.test(selectorUsed || "")) {
      score -= 90;
    }
    return {
      node,
      selectorUsed,
      score,
      disabled,
      visible,
      meta
    };
  }

  function findSendButton(documentRef, composer, diagnostics) {
    const selectorsChecked = [];
    const ranked = [];
    const seen = new Set();

    for (const selector of SEND_SELECTORS) {
      selectorsChecked.push(selector);
      documentRef.querySelectorAll(selector).forEach((node) => {
        if (seen.has(node)) {
          return;
        }
        seen.add(node);
        const rankedCandidate = rankSendButtonCandidate(node, selector, composer);
        if (rankedCandidate) {
          ranked.push(rankedCandidate);
        }
      });
    }

    const composerForm = composer?.closest?.("form");
    if (composerForm && typeof composerForm.querySelectorAll === "function") {
      selectorsChecked.push("composer.closest(form) button");
      composerForm.querySelectorAll("button").forEach((node) => {
        if (seen.has(node)) {
          return;
        }
        seen.add(node);
        const rankedCandidate = rankSendButtonCandidate(node, "composer.closest(form) button", composer);
        if (rankedCandidate) {
          ranked.push(rankedCandidate);
        }
      });
    }

    diagnostics.sendSelectorsChecked = uniqueList([...(diagnostics.sendSelectorsChecked || []), ...selectorsChecked]);
    diagnostics.sendCandidatesConsidered = ranked
      .slice()
      .sort((left, right) => right.score - left.score)
      .map((entry) => `${entry.selectorUsed} [score=${entry.score}] ${textFromElement(entry.node) || "(no label)"}`)
      .slice(0, 8);

    const winner = ranked
      .filter((entry) => entry.visible && !entry.disabled && (isAllowedSendButtonText(textFromElement(entry.node)) || String(entry.meta.type || "").toLowerCase() === "submit"))
      .sort((left, right) => right.score - left.score)[0];

    if (!winner) {
      return null;
    }

    diagnostics.sendButtonFound = true;
    diagnostics.sendButtonSelectorUsed = winner.selectorUsed;
    diagnostics.sendButtonDisabled = winner.disabled ? "yes" : "no";
    diagnostics.sendButtonMeta = winner.meta;
    return winner.node;
  }

  function createToolFailure(code, message, diagnostics) {
    const error = new Error(message);
    error.toolFailureCode = code;
    error.toolFailureLabel = TOOL_FAILURE_LABELS[code] || code;
    error.diagnostics = diagnostics;
    return error;
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
      },
      paste() {
        return new view.Event("paste", {
          bubbles: true,
          cancelable: true,
          composed: true
        });
      }
    };
  }

  function clearContentEditableSelection(documentRef, composer) {
    const selection = documentRef.getSelection?.();
    if (!selection || typeof selection.removeAllRanges !== "function") {
      return false;
    }

    if (typeof documentRef.createRange !== "function") {
      return false;
    }

    const range = documentRef.createRange();
    range.selectNodeContents(composer);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  function setComposerText(composer, text) {
    if (typeof composer.value === "string") {
      composer.value = text;
      composer.setSelectionRange?.(text.length, text.length);
      return "textarea_value";
    }

    composer.textContent = text;
    return "contenteditable_textContent";
  }

  function dispatchComposerEvents(composer, text, documentRef, diagnostics) {
    const events = createEventFactory(documentRef);
    composer.dispatchEvent(events.input("beforeinput", text));
    diagnostics?.eventsDispatched.push("beforeinput");
    composer.dispatchEvent(events.input("input", text));
    diagnostics?.eventsDispatched.push("input");
    composer.dispatchEvent(events.change());
    diagnostics?.eventsDispatched.push("change");
  }

  function getComposerText(composer) {
    if (!composer) {
      return "";
    }
    return typeof composer.value === "string" ? composer.value : composer.innerText || composer.textContent || "";
  }

  function tryExecCommandInsert(documentRef, text) {
    const command = documentRef.execCommand;
    if (typeof command !== "function") {
      return false;
    }
    try {
      return command.call(documentRef, "insertText", false, text);
    } catch (_error) {
      return false;
    }
  }

  function insertContentEditableText(documentRef, composer, text, diagnostics) {
    clearContentEditableSelection(documentRef, composer);
    composer.textContent = "";

    const execInserted = tryExecCommandInsert(documentRef, text);
    if (execInserted) {
      diagnostics.insertionMethodUsed = "contenteditable_execCommand_insertText";
    } else {
      composer.textContent = text;
      diagnostics.insertionMethodUsed = "contenteditable_textContent";
    }

    dispatchComposerEvents(composer, text, documentRef, diagnostics);
    composer.dispatchEvent(createEventFactory(documentRef).paste());
    diagnostics.eventsDispatched.push("paste");
    return diagnostics.insertionMethodUsed;
  }

  async function syncComposerText(documentRef, composer, text, diagnostics) {
    if (typeof composer.value === "string") {
      diagnostics.insertionMethodUsed = setComposerText(composer, text);
      dispatchComposerEvents(composer, text, documentRef, diagnostics);
      return diagnostics.insertionMethodUsed;
    }

    return insertContentEditableText(documentRef, composer, text, diagnostics);
  }

  async function waitForSendControl(documentRef, composer, diagnostics, stopState, timeoutMs = 3500) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (stopState.stopRequested) {
        diagnostics.failureStage = "send_activation";
        diagnostics.lastError = "Runner stop requested before send.";
        throw createToolFailure("MESSAGE_NOT_SENT", diagnostics.lastError, diagnostics);
      }

      const sendButton = findSendButton(documentRef, composer, diagnostics);
      diagnostics.stateSyncWaitMs = Date.now() - startedAt;
      diagnostics.controlsAfterWait = collectComposerControls(composer);
      if (sendButton) {
        diagnostics.sendControlAppearedAfterWait = diagnostics.stateSyncWaitMs > 0;
        return sendButton;
      }

      await wait(150);
    }

    diagnostics.stateSyncWaitMs = Date.now() - startedAt;
    diagnostics.controlsAfterWait = collectComposerControls(composer);
    return null;
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

  async function waitForAssistantStartAndCompletion(documentRef, baseline, runConfig, stopState, caseResult, overlay, diagnostics, composer) {
    const startTimeoutMs = Number(runConfig.assistant_start_timeout_ms || 30000);
    const completeTimeoutMs = Number(runConfig.assistant_complete_timeout_ms || 120000);
    const stabilityWaitMs = Number(runConfig.assistant_stability_wait_ms || runConfig.stability_wait_ms || 2000);
    const startedAt = Date.now();
    let started = false;
    let latestObservedText = "";
    let stableSince = null;

    while (Date.now() - startedAt < completeTimeoutMs) {
      if (stopState.stopRequested) {
        diagnostics.failureStage = "response_observe";
        diagnostics.lastError = "Runner stop requested.";
        pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, "response_observe", "run_stopped", diagnostics.lastError);
        throw createToolFailure("MESSAGE_NOT_SENT", diagnostics.lastError, diagnostics);
      }

      const assistantMessages = collectAssistantMessages(documentRef);
      const newest = assistantMessages[assistantMessages.length - 1] || "";
      const stopVisible = isStopButtonVisible(documentRef);
      const thinkingVisible = looksLikeThinking(newest) || stopVisible;
      const hasNewTurn = assistantMessages.length > baseline.count || newest !== baseline.lastText;

      if (!started && Date.now() - startedAt > startTimeoutMs) {
        diagnostics.failureStage = "response_observe";
        diagnostics.lastError = "Timed out waiting for assistant to start responding.";
        pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, "response_observe", "timeout_waiting_for_completion", diagnostics.lastError);
        throw createToolFailure("TURN_SEQUENCING_NO_ASSISTANT_COMPLETION", diagnostics.lastError, diagnostics);
      }

      if (hasNewTurn) {
        started = true;
        pushDomTurnTrace(
          caseResult,
          documentRef,
          composer,
          diagnostics,
          "response_observe",
          thinkingVisible ? "assistant_thinking_seen" : "waiting_for_assistant_stable",
          thinkingVisible ? "Thinking detected, holding next scripted reply." : "Assistant content changed."
        );
      }

      if (!started) {
        overlay?.setStatus("Waiting for assistant to start...");
        pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, "response_observe", "waiting_for_assistant_start", "Waiting for assistant message count or text change.");
        await wait(300);
        continue;
      }

      if (thinkingVisible || !cleanText(newest) || looksLikeThinking(newest)) {
        stableSince = null;
        overlay?.setStatus("Thinking detected, holding next scripted reply...");
        await wait(300);
        continue;
      }

      if (newest !== latestObservedText) {
        latestObservedText = newest;
        stableSince = Date.now();
        overlay?.setStatus("Waiting for assistant to finish...");
        pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, "response_observe", "waiting_for_assistant_stable", "Assistant text changed; waiting for stability window.");
        await wait(300);
        continue;
      }

      if (stableSince && Date.now() - stableSince >= stabilityWaitMs && !stopVisible) {
        overlay?.setStatus("Assistant response stable.");
        pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, "response_observe", "assistant_stable", "Assistant text remained stable past the completion window.");
        return {
          latestText: newest,
          allMessages: assistantMessages
        };
      }

      await wait(300);
    }

    diagnostics.failureStage = "response_observe";
    diagnostics.lastError = "Timed out waiting for assistant completion.";
    pushDomTurnTrace(caseResult, documentRef, composer, diagnostics, "response_observe", "timeout_waiting_for_completion", diagnostics.lastError);
    throw createToolFailure("TURN_SEQUENCING_NO_ASSISTANT_COMPLETION", diagnostics.lastError, diagnostics);
  }

  async function waitForReadyToSend(documentRef, runConfig, stopState, caseResult, overlay, actor) {
    const completeTimeoutMs = Number(runConfig.assistant_complete_timeout_ms || 120000);
    const stabilityWaitMs = Number(runConfig.assistant_stability_wait_ms || runConfig.stability_wait_ms || 2000);
    const startedAt = Date.now();
    let lastAssistantText = "";
    let stableSince = null;

    while (Date.now() - startedAt < completeTimeoutMs) {
      if (stopState.stopRequested) {
        pushDomTurnTrace(caseResult, documentRef, null, null, "pre_send_wait", "run_stopped", "Stop requested before scripted send.");
        throw createToolFailure("MESSAGE_NOT_SENT", "Runner stop requested before scripted send.", {
          ...makeAttemptDiagnostics(),
          failureStage: "send_activation",
          lastError: "Runner stop requested before scripted send.",
          domTurnTrace: caseResult.dom_turn_trace
        });
      }

      const assistantMessages = collectAssistantMessages(documentRef);
      const latestAssistant = assistantMessages[assistantMessages.length - 1] || "";
      const stopVisible = isStopButtonVisible(documentRef);
      const thinkingVisible = looksLikeThinking(latestAssistant) || stopVisible;

      if (thinkingVisible) {
        stableSince = null;
        overlay?.setStatus("Thinking detected, holding next scripted reply...");
        pushDomTurnTrace(caseResult, documentRef, null, null, "pre_send_wait", "assistant_thinking_seen", `${actor} blocked while generation is active.`);
        await wait(300);
        continue;
      }

      if (latestAssistant && latestAssistant !== lastAssistantText) {
        lastAssistantText = latestAssistant;
        stableSince = Date.now();
        overlay?.setStatus("Waiting for assistant to finish...");
        pushDomTurnTrace(caseResult, documentRef, null, null, "pre_send_wait", "waiting_for_assistant_stable", `${actor} waiting for assistant stability.`);
        await wait(300);
        continue;
      }

      if (!latestAssistant) {
        return;
      }

      if (stableSince && Date.now() - stableSince >= stabilityWaitMs) {
        overlay?.setStatus("Assistant response stable, sending next scripted reply...");
        pushDomTurnTrace(caseResult, documentRef, null, null, "pre_send_wait", "assistant_stable", `${actor} may send now.`);
        return;
      }

      await wait(300);
    }

    pushDomTurnTrace(caseResult, documentRef, null, null, "pre_send_wait", "timeout_waiting_for_completion", `${actor} timed out waiting for assistant completion.`);
    const diagnostics = makeAttemptDiagnostics();
    diagnostics.failureStage = "response_observe";
    diagnostics.lastError = "Timed out waiting for assistant completion before next scripted reply.";
    diagnostics.domTurnTrace = caseResult.dom_turn_trace;
    throw createToolFailure("TURN_SEQUENCING_NO_ASSISTANT_COMPLETION", diagnostics.lastError, diagnostics);
  }

  async function sendMessage(documentRef, text, stopState) {
    const diagnostics = makeAttemptDiagnostics();
    if (stopState.stopRequested) {
      diagnostics.failureStage = "send_activation";
      diagnostics.lastError = "Runner stop requested before send.";
      throw createToolFailure("MESSAGE_NOT_SENT", diagnostics.lastError, diagnostics);
    }

    const composerRecord = findComposer(documentRef, diagnostics);
    if (!composerRecord) {
      diagnostics.failureStage = "composer_insert";
      diagnostics.lastError = "ChatGPT composer not found.";
      throw createToolFailure("COMPOSER_NOT_FOUND", diagnostics.lastError, diagnostics);
    }
    const composer = composerRecord.node;
    diagnostics.composerFound = true;
    diagnostics.composerSelectorUsed = composerRecord.selectorUsed;
    diagnostics.composerKind = composerRecord.composerKind;
    diagnostics.controlsBeforeInsert = collectComposerControls(composer);

    composer.focus?.();
    await syncComposerText(documentRef, composer, text, diagnostics);
    const composerText = getComposerText(composer);
    diagnostics.composerTextLength = composerText.length;
    diagnostics.composerTextVerified = composerText.includes(String(text || "").slice(0, Math.min(String(text || "").length, 24)));
    diagnostics.controlsAfterInsert = collectComposerControls(composer);

    if (!diagnostics.composerTextVerified || !cleanText(composerText)) {
      diagnostics.failureStage = "composer_insert";
      diagnostics.lastError = "Composer text verification failed.";
      throw createToolFailure("COMPOSER_INSERT_VERIFY", diagnostics.lastError, diagnostics);
    }

    diagnostics.failureStage = "composer_state_sync";
    const sendButton = await waitForSendControl(documentRef, composer, diagnostics, stopState);
    if (!sendButton) {
      diagnostics.lastError = "Visible send button not found.";
      diagnostics.sendButtonFound = false;
      if (diagnostics.composerTextVerified) {
        diagnostics.failureStage = "composer_state_sync";
        throw createToolFailure("COMPOSER_STATE_NOT_SYNCED", "Text was inserted and verified, but ChatGPT did not enable a Send button.", diagnostics);
      }
      diagnostics.failureStage = "send_control_find";
      throw createToolFailure("SEND_BUTTON_NOT_FOUND", diagnostics.lastError, diagnostics);
    }

    diagnostics.failureStage = "send_activation";
    diagnostics.submitAttempted = true;
    sendButton.click();
    return diagnostics;
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
      raw_turn_log: [],
      dom_turn_trace: [],
      case_status: "PENDING",
      packet_prepared: Boolean(caseDef.packet),
      packet_submitted: false,
      tool_failure_label: null,
      diagnostics: null
    };
  }

  function buildEmptyCaseFailure(caseDef, message, toolFailureLabel, diagnostics) {
    const failure = buildCaseResult(caseDef);
    failure.notes = message;
    failure.case_status = toolFailureLabel === TOOL_FAILURE_LABELS.TURN_SEQUENCING_NO_ASSISTANT_COMPLETION ? "TOOL_FAILED" : "NOT_SENT";
    failure.tool_failure_label = toolFailureLabel || null;
    failure.diagnostics = diagnostics || null;
    failure.dom_turn_trace = diagnostics?.domTurnTrace || failure.dom_turn_trace;
    return failure;
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
    if (caseResult.tool_failure_label) {
      return caseResult.tool_failure_label;
    }
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
    if (runResult.cases.some((caseResult) => caseResult.tool_failure_label)) {
      runResult.status = "TOOL_FAILED";
    } else if ((runResult.errors || []).length > 0) {
      runResult.status = "FAILED";
    } else {
      runResult.status = "COMPLETED";
    }
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
      if (actor !== "packet") {
        await waitForReadyToSend(documentRef, runConfig, stopState, caseResult, runConfig.overlayRef, actor);
      }
      const baseline = createBaseline(documentRef);
      pushDomTurnTrace(caseResult, documentRef, null, null, "send", actor === "packet" ? "before_packet_insert" : "before_scripted_reply_send", `Preparing to send ${actor}.`);
      caseResult.raw_turn_log.push({
        at: nowIso(),
        actor,
        text: actorText
      });
      const sendDiagnostics = await sendMessage(documentRef, actorText, stopState);
      caseResult.packet_submitted = actor === "packet" ? true : caseResult.packet_submitted;
      caseResult.case_status = "SENT";
      caseResult.diagnostics = sendDiagnostics;
      sendDiagnostics.domTurnTrace = caseResult.dom_turn_trace;
      pushDomTurnTrace(caseResult, documentRef, null, sendDiagnostics, "send", actor === "packet" ? "after_packet_send" : "after_scripted_reply_send", `${actor} submitted.`);
      const observation = await waitForAssistantStartAndCompletion(
        documentRef,
        baseline,
        runConfig,
        stopState,
        caseResult,
        runConfig.overlayRef,
        sendDiagnostics,
        null
      ).catch((error) => {
        if (error.toolFailureLabel) {
          throw error;
        }
        throw createToolFailure("RESPONSE_NOT_OBSERVED", error.message, sendDiagnostics);
      });
      const latestText = observation.latestText;
      if (looksLikeThinking(latestText)) {
        sendDiagnostics.failureStage = "response_observe";
        sendDiagnostics.lastError = "Thinking was observed without assistant completion.";
        throw createToolFailure("TURN_SEQUENCING_NO_ASSISTANT_COMPLETION", sendDiagnostics.lastError, sendDiagnostics);
      }
      caseResult.assistant_responses.push(latestText);
      caseResult.visible_turn_text = latestText;
      caseResult.case_status = "RESPONDED";
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

    const runConfig = {
      ...(suite.run_config || {}),
      overlayRef: overlay
    };
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
        const toolFailureLabel = error.toolFailureLabel || null;
        const diagnostics = error.diagnostics || null;
        runResult.cases.push(buildEmptyCaseFailure(caseDef, error.message, toolFailureLabel, diagnostics));
        if (diagnostics) {
          overlay.setDiagnostics(describeDiagnostics(diagnostics));
        }
        if (toolFailureLabel) {
          runResult.status = "TOOL_FAILED";
          runResult.warnings.push("Run stopped because runner could not send messages.");
          const stopMessage = toolFailureLabel === TOOL_FAILURE_LABELS.COMPOSER_STATE_NOT_SYNCED
            ? "Text was inserted and verified, but ChatGPT did not enable a Send button. This is a composer state-sync failure."
            : toolFailureLabel === TOOL_FAILURE_LABELS.SEND_BUTTON_NOT_FOUND
              ? "Stopped: visible ChatGPT send button not found."
              : `Stopped: ${error.message}`;
          overlay.setStatus(stopMessage);
          break;
        }
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
    overlay.setRunLabel("Running...");
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

    const uploadOutcome = await bestEffortUploadResult(serverBaseUrl, suite, runResult);
    const latestCaseDiagnostics = runResult.cases[runResult.cases.length - 1]?.diagnostics || null;
    if (latestCaseDiagnostics) {
      overlay.setDiagnostics(describeDiagnostics(latestCaseDiagnostics));
    }
    if (!uploadOutcome.ok) {
      runResult.warnings.push(uploadOutcome.message);
      overlay.setStatus(`Run complete.\n${uploadOutcome.message}`);
    } else {
      overlay.setStatus("Run complete. Result uploaded locally and downloaded.");
    }

    overlay.setRunDisabled(false);
    overlay.setRunLabel("Re-run");
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
    let rerunCount = 0;

    overlay.copyDiagnosticsButton.addEventListener("click", async () => {
      const diagnosticsText = overlay.lastDiagnosticsText || "No diagnostics yet.";
      try {
        await root.navigator?.clipboard?.writeText?.(diagnosticsText);
        overlay.setStatus("Diagnostics copied.");
      } catch (_error) {
        overlay.setStatus("Diagnostics copy failed.");
      }
    });

    overlay.stopButton.addEventListener("click", () => {
      stopState.stopRequested = true;
      overlay.setStatus("Stop requested.");
      overlay.setRunDisabled(false);
      overlay.setRunLabel("Re-run");
    });

    overlay.runButton.addEventListener("click", async () => {
      stopState.stopRequested = false;
       rerunCount += 1;
      try {
        await runSelfContainedSuite({
          documentRef,
          locationRef,
          suite,
          runId: rerunCount === 1 ? runId : `${runId}-r${rerunCount}`,
          serverBaseUrl,
          overlay,
          stopState
        });
      } catch (error) {
        overlay.setRunDisabled(false);
        overlay.setRunLabel("Re-run");
        overlay.setStatus(`Run failed: ${error.message}`);
        if (error?.diagnostics) {
          overlay.setDiagnostics(describeDiagnostics(error.diagnostics));
        }
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
    installSelfContained,
    __test: {
      TOOL_FAILURE_LABELS,
      makeAttemptDiagnostics,
      describeDiagnostics,
      rankSendButtonCandidate,
      findSendButton,
      runSuiteLocally
    }
  };
});
