const test = require("node:test");
const assert = require("node:assert/strict");

const { runInsertOnlySmoke } = require("../../src/content/orion-ttd-insert-only.js");
const { WITNESS_NODE_ID } = require("../../src/content/witness.js");

class FakeEvent {
  constructor(type, init = {}) {
    this.type = type;
    Object.assign(this, init);
  }
}

class FakeElement {
  constructor({ tagName = "TEXTAREA", id = "", selector = "", contenteditable = false } = {}) {
    this.tagName = tagName;
    this.id = id;
    this.selector = selector;
    this.value = tagName === "TEXTAREA" ? "" : undefined;
    this.textContent = "";
    this.disabled = false;
    this.readOnly = false;
    this._contentEditable = contenteditable;
    this.events = [];
    this.dataset = {};
    this.attributes = {};
    this.style = {};
  }

  get isContentEditable() {
    return this._contentEditable;
  }

  getAttribute(name) {
    if (Object.hasOwn(this.attributes, name)) {
      return this.attributes[name];
    }
    if (name === "contenteditable" && this._contentEditable) {
      return "true";
    }
    if (name === "data-testid" && this.selector.includes("data-testid")) {
      return "prompt-textarea";
    }
    return null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  dispatchEvent(event) {
    this.events.push(event.type);
    return true;
  }

  focus() {}

  setSelectionRange(start, end) {
    this.selection = [start, end];
  }
}

function createFakeDocument(targetSelector, element) {
  const root = new FakeElement({ tagName: "HTML" });
  root.dataset = {};
  const body = new FakeElement({ tagName: "BODY" });
  body.children = [];
  body.appendChild = function appendChild(child) {
    this.children.push(child);
    return child;
  };
  const nodeMap = new Map();
  return {
    documentElement: root,
    body,
    defaultView: {
      Event: FakeEvent,
      InputEvent: FakeEvent
    },
    createElement(tagName) {
      return new FakeElement({ tagName: String(tagName).toUpperCase() });
    },
    querySelector(selector) {
      if (selector === `#${WITNESS_NODE_ID}`) {
        return nodeMap.get(WITNESS_NODE_ID) || null;
      }
      if (selector === targetSelector) {
        return element;
      }
      return null;
    },
    registerNode(node) {
      if (node?.id) {
        nodeMap.set(node.id, node);
      }
    }
  };
}

function attachWitnessTracking(documentRef) {
  const originalAppendChild = documentRef.body.appendChild.bind(documentRef.body);
  documentRef.body.appendChild = function trackedAppendChild(child) {
    const appended = originalAppendChild(child);
    documentRef.registerNode(appended);
    return appended;
  };
}

test("insert-only smoke writes packet into textarea and dispatches input events", () => {
  const composer = new FakeElement({ tagName: "TEXTAREA", id: "prompt-textarea" });
  const documentRef = createFakeDocument("#prompt-textarea", composer);
  attachWitnessTracking(documentRef);
  const consoleCalls = [];

  const result = runInsertOnlySmoke({
    documentRef,
    consoleRef: {
      info(...args) {
        consoleCalls.push(args);
      }
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.selectorUsed, "#prompt-textarea");
  assert.equal(result.submitAttempted, false);
  assert.match(composer.value, /^TTD_ORION_POC_V1/);
  assert.deepEqual(composer.events, ["beforeinput", "input", "change"]);
  assert.equal(documentRef.documentElement.dataset.orionTtdInsertOnlyLastOk, "true");
  assert.equal(documentRef.documentElement.dataset.orionTtdLastWitnessKind, "insert_only_smoke_result");
  assert.match(documentRef.documentElement.dataset.orionTtdLastWitness, /"submitAttempted":false/);
  assert.equal(consoleCalls.length, 2);
  assert.equal(consoleCalls[0][0], "[ORION_TTD]");
  assert.equal(consoleCalls[1][0], "[ORION_TTD]");
  const witnessNode = documentRef.querySelector(`#${WITNESS_NODE_ID}`);
  assert.ok(witnessNode);
  assert.equal(witnessNode.textContent, documentRef.documentElement.dataset.orionTtdLastWitness);
});

test("insert-only smoke refuses to overwrite a non-empty composer by default", () => {
  const composer = new FakeElement({ tagName: "TEXTAREA", id: "prompt-textarea" });
  composer.value = "draft in progress";
  const documentRef = createFakeDocument("#prompt-textarea", composer);
  attachWitnessTracking(documentRef);

  const result = runInsertOnlySmoke({ documentRef });

  assert.equal(result.ok, false);
  assert.equal(result.blockedReason, "composer_not_empty");
  assert.equal(result.submitAttempted, false);
  assert.equal(composer.value, "draft in progress");
});

test("insert-only smoke can target contenteditable composer surfaces", () => {
  const composer = new FakeElement({
    tagName: "DIV",
    id: "prompt-textarea",
    selector: "div[contenteditable='true'][id='prompt-textarea']",
    contenteditable: true
  });
  const documentRef = createFakeDocument("div[contenteditable='true'][id='prompt-textarea']", composer);
  attachWitnessTracking(documentRef);

  const result = runInsertOnlySmoke({
    documentRef,
    selectors: ["div[contenteditable='true'][id='prompt-textarea']"]
  });

  assert.equal(result.ok, true);
  assert.equal(result.composerKind, "contenteditable");
  assert.match(composer.textContent, /^TTD_ORION_POC_V1/);
  assert.deepEqual(composer.events, ["beforeinput", "input", "change"]);
  assert.equal(documentRef.documentElement.dataset.orionTtdLastWitnessKind, "insert_only_smoke_result");
});
