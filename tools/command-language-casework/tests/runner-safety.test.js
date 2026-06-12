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
  const overlay = {
    statuses: [],
    diagnostics: [],
    setStatus(text) {
      this.statuses.push(text);
    },
    setDiagnostics(text) {
      this.diagnostics.push(text);
    }
  };
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

  const overlay = {
    statuses: [],
    diagnostics: [],
    setStatus(text) {
      this.statuses.push(text);
    },
    setDiagnostics(text) {
      this.diagnostics.push(text);
    }
  };
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
