const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const files = [
  path.resolve(__dirname, "..", "public", "casework-ui.js"),
  path.resolve(__dirname, "..", "injectors", "chatgpt-casework-runner.js")
];

test("browser-side casework code avoids forbidden storage and credential APIs", () => {
  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    for (const forbidden of [
      "document.cookie",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "navigator.credentials",
      "chrome.cookies"
    ]) {
      assert.equal(source.includes(forbidden), false, `${path.basename(filePath)} should not reference ${forbidden}`);
    }
  }
});
