import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { runInsertOnlySmoke } = require("../../src/content/orion-ttd-insert-only.js");

class FakeEvent {
  constructor(type, init = {}) {
    this.type = type;
    Object.assign(this, init);
  }
}

class FakeElement {
  constructor(kind) {
    this.tagName = kind === "contenteditable" ? "DIV" : "TEXTAREA";
    this.id = "prompt-textarea";
    this.value = kind === "textarea" ? "" : undefined;
    this.textContent = "";
    this.disabled = false;
    this.readOnly = false;
    this.kind = kind;
    this.events = [];
  }

  get isContentEditable() {
    return this.kind === "contenteditable";
  }

  getAttribute(name) {
    if (name === "contenteditable" && this.isContentEditable) {
      return "true";
    }
    if (name === "data-testid") {
      return "prompt-textarea";
    }
    return null;
  }

  focus() {}

  setSelectionRange() {}

  dispatchEvent(event) {
    this.events.push(event.type);
    return true;
  }
}

function runCase(kind, selectors) {
  const composer = new FakeElement(kind);
  const root = { dataset: {} };
  const documentRef = {
    documentElement: root,
    defaultView: {
      Event: FakeEvent,
      InputEvent: FakeEvent
    },
    querySelector(selector) {
      return selectors.includes(selector) ? composer : null;
    }
  };

  return {
    result: runInsertOnlySmoke({ documentRef, selectors }),
    composer,
    dataset: root.dataset
  };
}

const textareaCase = runCase("textarea", ["#prompt-textarea"]);
const contenteditableCase = runCase("contenteditable", ["div[contenteditable='true'][id='prompt-textarea']"]);

const summary = {
  textarea: {
    ok: textareaCase.result.ok,
    selectorUsed: textareaCase.result.selectorUsed,
    events: textareaCase.composer.events,
    startsWithMarker: textareaCase.composer.value.startsWith("TTD_ORION_POC_V1"),
    submitAttempted: textareaCase.result.submitAttempted
  },
  contenteditable: {
    ok: contenteditableCase.result.ok,
    selectorUsed: contenteditableCase.result.selectorUsed,
    events: contenteditableCase.composer.events,
    startsWithMarker: contenteditableCase.composer.textContent.startsWith("TTD_ORION_POC_V1"),
    submitAttempted: contenteditableCase.result.submitAttempted
  }
};

console.log(JSON.stringify(summary, null, 2));

if (
  !summary.textarea.ok ||
  !summary.contenteditable.ok ||
  !summary.textarea.startsWithMarker ||
  !summary.contenteditable.startsWithMarker ||
  summary.textarea.submitAttempted ||
  summary.contenteditable.submitAttempted
) {
  process.exitCode = 1;
}
