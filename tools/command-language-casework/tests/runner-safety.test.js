const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const runnerPath = path.resolve(__dirname, "..", "injectors", "chatgpt-casework-runner.js");
const runnerSource = fs.readFileSync(runnerPath, "utf8");
const runner = require(runnerPath);

test("runner source does not reference forbidden private storage or credential APIs", () => {
  for (const forbidden of [
    "document.cookie",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "navigator.credentials",
    "chrome.cookies"
  ]) {
    assert.equal(runnerSource.includes(forbidden), false, forbidden);
  }
});

test("runner source keeps send behavior behind explicit casework control", () => {
  assert.match(runnerSource, /Accepted run/);
  assert.match(runnerSource, /Runner stop requested before send/);
  assert.match(runnerSource, /Visible send button not found/);
});

test("runner source supports self-contained payload without auto-run and with download fallback", () => {
  assert.match(runnerSource, /installSelfContained/);
  assert.match(runnerSource, /Nothing will send until you click Run/);
  assert.match(runnerSource, /overlay\.runButton\.addEventListener\("click", async \(\) =>/);
  assert.match(runnerSource, /triggerDownload/);
  assert.match(runnerSource, /navigator\?\.clipboard\?\.writeText/);
  assert.match(runnerSource, /Paste the result back into ChatGPT\./);
  assert.match(runnerSource, /Local result upload was blocked by ChatGPT CSP/);
});

function createFakeButton({ ariaLabel = "", title = "", dataTestId = "", type = "", text = "", disabled = false, visible = true, formId = "form-a" } = {}) {
  return {
    disabled,
    textContent: text,
    closest(selector) {
      if (selector === "form") {
        return formId ? { id: formId } : null;
      }
      return null;
    },
    getAttribute(name) {
      if (name === "aria-label") {
        return ariaLabel;
      }
      if (name === "title") {
        return title;
      }
      if (name === "data-testid") {
        return dataTestId;
      }
      if (name === "type") {
        return type;
      }
      if (name === "aria-disabled") {
        return disabled ? "true" : "false";
      }
      return "";
    },
    getBoundingClientRect() {
      return visible ? { width: 32, height: 32 } : { width: 0, height: 0 };
    }
  };
}

function createContentEditableComposer() {
  return {
    disabled: false,
    readOnly: false,
    isContentEditable: true,
    textContent: "",
    innerText: "",
    ownerDocument: null,
    parentElement: {
      contains() {
        return false;
      },
      querySelectorAll() {
        return [];
      }
    },
    closest(selector) {
      if (selector === "form") {
        return {
          querySelectorAll() {
            return [];
          }
        };
      }
      return null;
    },
    focus() {},
    getAttribute(name) {
      if (name === "contenteditable") {
        return "true";
      }
      return "";
    },
    dispatchEvent() {
      return true;
    },
    getBoundingClientRect() {
      return { width: 200, height: 40 };
    }
  };
}

function createOverlayRecorder() {
  return {
    statuses: [],
    diagnostics: [],
    setStatus(text) {
      this.statuses.push(text);
    },
    setDiagnostics(text) {
      this.diagnostics.push(text);
    }
  };
}

test("send button ranking prefers visible send-like button and ignores disabled or non-send buttons", () => {
  const composer = {
    closest(selector) {
      if (selector === "form") {
        return { id: "form-a" };
      }
      return null;
    },
    parentElement: {
      contains(node) {
        return node?.getAttribute?.("data-testid") === "composer-send-button";
      }
    }
  };

  const disabledSend = createFakeButton({
    ariaLabel: "Send message",
    dataTestId: "send-button",
    disabled: true
  });
  const micButton = createFakeButton({
    ariaLabel: "Use microphone",
    dataTestId: "mic-button",
    text: "Mic"
  });
  const goodSend = createFakeButton({
    ariaLabel: "Send prompt",
    dataTestId: "composer-send-button",
    type: "submit"
  });

  const documentRef = {
    querySelectorAll(selector) {
      if (selector === "button[data-testid='send-button']") {
        return [disabledSend];
      }
      if (selector === "button[data-testid='composer-send-button']") {
        return [goodSend];
      }
      if (selector === "button[aria-label*='Send']") {
        return [disabledSend, goodSend];
      }
      if (selector === "button[aria-label*='send']") {
        return [disabledSend, goodSend];
      }
      if (selector === "button[type='submit']") {
        return [goodSend];
      }
      if (selector === "form button") {
        return [disabledSend, micButton, goodSend];
      }
      return [];
    }
  };

  const diagnostics = runner.__test.makeAttemptDiagnostics();
  const winner = runner.__test.findSendButton(documentRef, composer, diagnostics);
  assert.equal(winner, goodSend);
  assert.equal(diagnostics.sendButtonFound, true);
  assert.equal(diagnostics.sendButtonSelectorUsed, "button[data-testid='composer-send-button']");
  assert.match(diagnostics.sendCandidatesConsidered.join("\n"), /composer-send-button/);
});

test("tool failure run stops after first composer state-sync failure and records NOT_SENT", async () => {
  const composer = {
    value: "",
    disabled: false,
    readOnly: false,
    focus() {},
    setSelectionRange() {},
    dispatchEvent() {
      return true;
    },
    getBoundingClientRect() {
      return { width: 200, height: 40 };
    }
  };
  const documentRef = {
    title: "Disposable ChatGPT Test",
    defaultView: {
      Event: class Event {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      },
      InputEvent: class InputEvent {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      }
    },
    querySelector(selector) {
      if (selector === "#prompt-textarea") {
        return composer;
      }
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
  const overlay = createOverlayRecorder();
  const suite = {
    suite_id: "desk-reset-v0",
    run_config: {
      stop_on_case_failure: false,
      stop_after_each_case: false
    },
    cases: [
      {
        case_id: "case-001",
        title: "First case",
        research_question: "Question",
        packet: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"clear_trash\"}",
        scripted_user_replies: []
      },
      {
        case_id: "case-002",
        title: "Second case",
        research_question: "Question",
        packet: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"collect_dishes\"}",
        scripted_user_replies: []
      }
    ]
  };

  const runResult = await runner.__test.runSuiteLocally({
    documentRef,
    suite,
    runId: "self-contained-test",
    stopState: { stopRequested: false },
    overlay,
    browserContextNote: "Test"
  });

  assert.equal(runResult.status, "TOOL_FAILED");
  assert.equal(runResult.cases.length, 1);
  assert.equal(runResult.cases[0].case_status, "NOT_SENT");
  assert.equal(runResult.cases[0].heuristic_classification, "TOOL_FAIL_COMPOSER_STATE_NOT_SYNCED");
  assert.match(runResult.warnings.join("\n"), /runner could not send messages/i);
  assert.match(overlay.statuses.join("\n"), /composer state-sync failure/i);
  assert.match(overlay.diagnostics.join("\n"), /send button found: no/);
});

test("contenteditable insertion records insertion method and state-sync failure when send control never appears", async () => {
  const composer = createContentEditableComposer();
  const documentRef = {
    title: "Disposable ChatGPT Test",
    defaultView: {
      Event: class Event {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      },
      InputEvent: class InputEvent {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      }
    },
    execCommand(_command, _showUi, value) {
      composer.textContent = value;
      composer.innerText = value;
      return true;
    },
    getSelection() {
      return {
        removeAllRanges() {},
        addRange() {}
      };
    },
    createRange() {
      return {
        selectNodeContents() {}
      };
    },
    querySelector(selector) {
      if (selector === "#prompt-textarea") {
        return composer;
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "form button") {
        return [
          createFakeButton({ ariaLabel: "Add files and more", dataTestId: "composer-plus-btn" }),
          createFakeButton({ ariaLabel: "Start Voice", text: "Start Voice" })
        ];
      }
      return [];
    }
  };
  composer.ownerDocument = documentRef;

  const overlay = createOverlayRecorder();
  const suite = {
    suite_id: "desk-reset-v0",
    run_config: {
      stop_on_case_failure: false,
      stop_after_each_case: false
    },
    cases: [
      {
        case_id: "case-001",
        title: "First case",
        research_question: "Question",
        packet: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"clear_trash\"}",
        scripted_user_replies: []
      }
    ]
  };

  const runResult = await runner.__test.runSuiteLocally({
    documentRef,
    suite,
    runId: "self-contained-contenteditable-test",
    stopState: { stopRequested: false },
    overlay,
    browserContextNote: "Test"
  });

  assert.equal(runResult.status, "TOOL_FAILED");
  assert.equal(runResult.cases[0].tool_failure_label, "TOOL_FAIL_COMPOSER_STATE_NOT_SYNCED");
  assert.equal(runResult.cases[0].heuristic_classification, "TOOL_FAIL_COMPOSER_STATE_NOT_SYNCED");
  assert.equal(runResult.cases[0].diagnostics.insertionMethodUsed, "contenteditable_execCommand_insertText");
  assert.equal(runResult.cases[0].diagnostics.sendControlAppearedAfterWait, false);
  assert.equal(runResult.cases[0].diagnostics.failureStage, "composer_state_sync");
  assert.match(overlay.statuses.join("\n"), /composer state-sync failure/i);
  assert.match(overlay.diagnostics.join("\n"), /insertion method used: contenteditable_execCommand_insertText/);
});

test("thinking is not accepted as a completed assistant response and completion timeout becomes turn-sequencing failure", async () => {
  const composer = {
    value: "",
    disabled: false,
    readOnly: false,
    focus() {},
    setSelectionRange() {},
    dispatchEvent() {
      return true;
    },
    closest() {
      return {
        querySelectorAll() {
          return [];
        }
      };
    },
    parentElement: {
      contains() {
        return false;
      }
    },
    getBoundingClientRect() {
      return { width: 200, height: 40 };
    }
  };
  const sendButton = createFakeButton({
    ariaLabel: "Send message",
    dataTestId: "send-button",
    type: "submit"
  });
  sendButton.click = () => {};
  const assistantNode = {
    textContent: "Thinking",
    getBoundingClientRect() {
      return { width: 200, height: 40 };
    }
  };
  const stopButton = createFakeButton({
    ariaLabel: "Stop answering",
    dataTestId: "stop-button",
    text: "Stop answering"
  });

  const documentRef = {
    title: "Disposable ChatGPT Test",
    defaultView: {
      Event: class Event {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      },
      InputEvent: class InputEvent {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      }
    },
    querySelector(selector) {
      if (selector === "#prompt-textarea") {
        return composer;
      }
      if (selector === "button[data-testid='send-button']") {
        return sendButton;
      }
      if (selector === "button[data-testid='stop-button']") {
        return stopButton;
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "button[data-testid='send-button']") {
        return [sendButton];
      }
      if (selector === "button[type='submit']") {
        return [sendButton];
      }
      if (selector === "form button") {
        return [sendButton, stopButton];
      }
      if (selector === "[data-message-author-role='assistant']") {
        return [assistantNode];
      }
      return [];
    }
  };
  const overlay = createOverlayRecorder();
  const suite = {
    suite_id: "desk-reset-v0",
    run_config: {
      assistant_start_timeout_ms: 500,
      assistant_complete_timeout_ms: 1200,
      assistant_stability_wait_ms: 300,
      stop_on_case_failure: false,
      stop_after_each_case: false
    },
    cases: [
      {
        case_id: "case-001",
        title: "First case",
        research_question: "Question",
        packet: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"clear_trash\"}",
        scripted_user_replies: []
      }
    ]
  };

  const runResult = await runner.__test.runSuiteLocally({
    documentRef,
    suite,
    runId: "thinking-timeout-test",
    stopState: { stopRequested: false },
    overlay,
    browserContextNote: "Test"
  });

  assert.equal(runResult.status, "TOOL_FAILED");
  assert.equal(runResult.cases[0].tool_failure_label, "TOOL_FAIL_TURN_SEQUENCING_NO_ASSISTANT_COMPLETION");
  assert.notEqual(runResult.cases[0].visible_turn_text, "Thinking");
  assert.equal(runResult.cases[0].case_status, "TOOL_FAILED");
  assert.match(overlay.statuses.join("\n"), /Waiting for assistant to start|Stopped: Timed out waiting for assistant to start responding/);
});

test("dom turn trace records stop and thinking fields during sequencing wait", async () => {
  const composer = {
    value: "",
    disabled: false,
    readOnly: false,
    focus() {},
    setSelectionRange() {},
    dispatchEvent() {
      return true;
    },
    closest() {
      return {
        querySelectorAll() {
          return [];
        }
      };
    },
    parentElement: {
      contains() {
        return false;
      }
    },
    getBoundingClientRect() {
      return { width: 200, height: 40 };
    }
  };
  let stopVisible = true;
  const sendButton = createFakeButton({
    ariaLabel: "Send message",
    dataTestId: "send-button",
    type: "submit"
  });
  sendButton.click = () => {
    stopVisible = true;
  };
  const stopButton = createFakeButton({
    ariaLabel: "Stop answering",
    dataTestId: "stop-button",
    text: "Stop answering"
  });
  const assistantNode = {
    textContent: "Thinking",
    getBoundingClientRect() {
      return { width: 200, height: 40 };
    }
  };

  const documentRef = {
    title: "Disposable ChatGPT Test",
    defaultView: {
      Event: class Event {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      },
      InputEvent: class InputEvent {
        constructor(type, init = {}) {
          this.type = type;
          Object.assign(this, init);
        }
      }
    },
    querySelector(selector) {
      if (selector === "#prompt-textarea") {
        return composer;
      }
      if (selector === "button[data-testid='send-button']") {
        return sendButton;
      }
      if (selector === "button[data-testid='stop-button']" && stopVisible) {
        return stopButton;
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "button[data-testid='send-button']") {
        return [sendButton];
      }
      if (selector === "button[type='submit']") {
        return [sendButton];
      }
      if (selector === "form button") {
        return stopVisible ? [sendButton, stopButton] : [sendButton];
      }
      if (selector === "[data-message-author-role='assistant']") {
        return [assistantNode];
      }
      if (selector === "button") {
        return stopVisible ? [sendButton, stopButton] : [sendButton];
      }
      return [];
    }
  };

  const overlay = createOverlayRecorder();
  const suite = {
    suite_id: "desk-reset-v0",
    run_config: {
      assistant_start_timeout_ms: 200,
      assistant_complete_timeout_ms: 800,
      assistant_stability_wait_ms: 200,
      stop_on_case_failure: false,
      stop_after_each_case: false
    },
    cases: [
      {
        case_id: "case-001",
        title: "First case",
        research_question: "Question",
        packet: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"clear_trash\"}",
        scripted_user_replies: ["Continue"]
      }
    ]
  };

  const runResult = await runner.__test.runSuiteLocally({
    documentRef,
    suite,
    runId: "dom-trace-test",
    stopState: { stopRequested: false },
    overlay,
    browserContextNote: "Test"
  });

  const trace = runResult.cases[0].dom_turn_trace;
  assert.ok(Array.isArray(trace));
  assert.ok(trace.length > 0);
  assert.equal(typeof trace[0].thinking_visible, "boolean");
  assert.equal(typeof trace[0].stop_button_visible, "boolean");
  assert.ok("send_button_visible" in trace[0]);
  assert.ok("composer_text_length" in trace[0]);
  assert.ok(trace.some((entry) => entry.action_taken === "assistant_thinking_seen" || entry.action_taken === "waiting_for_assistant_start"));
});
