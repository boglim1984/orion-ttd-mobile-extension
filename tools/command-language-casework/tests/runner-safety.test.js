const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const runnerPath = path.resolve(__dirname, "..", "injectors", "chatgpt-casework-runner.js");
const runnerSource = fs.readFileSync(runnerPath, "utf8");

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
