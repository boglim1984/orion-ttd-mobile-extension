const test = require("node:test");
const assert = require("node:assert/strict");

const {
  WITNESS_NODE_ID,
  emitOrionTtdWitness
} = require("../../src/content/witness.js");

class FakeElement {
  constructor(tagName = "DIV") {
    this.tagName = tagName;
    this.dataset = {};
    this.attributes = {};
    this.style = {};
    this.textContent = "";
    this.children = [];
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

function createFakeDocument() {
  const documentElement = new FakeElement("HTML");
  const body = new FakeElement("BODY");
  const nodes = new Map();

  return {
    documentElement,
    body,
    createElement(tagName) {
      return new FakeElement(String(tagName).toUpperCase());
    },
    querySelector(selector) {
      if (selector === `#${WITNESS_NODE_ID}`) {
        return nodes.get(WITNESS_NODE_ID) || null;
      }
      return null;
    },
    registerNode(node) {
      if (node?.id) {
        nodes.set(node.id, node);
      }
    }
  };
}

test("witness helper writes dataset fields, logs to console, and creates witness node", () => {
  const documentRef = createFakeDocument();
  const originalAppendChild = documentRef.body.appendChild.bind(documentRef.body);
  documentRef.body.appendChild = function trackedAppendChild(child) {
    const appended = originalAppendChild(child);
    documentRef.registerNode(appended);
    return appended;
  };

  const consoleCalls = [];
  const result = emitOrionTtdWitness(
    "insert_only_smoke_result",
    { ok: true, submitAttempted: false },
    {
      documentRef,
      consoleRef: {
        info(...args) {
          consoleCalls.push(args);
        }
      },
      at: "2026-06-12T14:47:00.000Z"
    }
  );

  assert.equal(consoleCalls.length, 1);
  assert.equal(consoleCalls[0][0], "[ORION_TTD]");
  assert.equal(documentRef.documentElement.dataset.orionTtdLastWitnessKind, "insert_only_smoke_result");
  assert.equal(documentRef.documentElement.dataset.orionTtdLastWitnessAt, "2026-06-12T14:47:00.000Z");
  assert.equal(documentRef.documentElement.dataset.orionTtdLastWitness, result.serializedRecord);
  const witnessNode = documentRef.querySelector(`#${WITNESS_NODE_ID}`);
  assert.ok(witnessNode);
  assert.equal(witnessNode.textContent, result.serializedRecord);
  assert.equal(witnessNode.getAttribute("hidden"), "hidden");
  assert.equal(witnessNode.getAttribute("aria-hidden"), "true");
});
