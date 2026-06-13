const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const caseworkRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(caseworkRoot, "..", "..");

test("casework docs mention the three-surface workflow and reflection loop", () => {
  const files = [
    path.join(caseworkRoot, "README.md"),
    path.join(repoRoot, "docs", "ORION_TTD_COMMAND_LANGUAGE_CASEWORK_TOOL_V0.md"),
    path.join(repoRoot, "reports", "command-language-casework-tool-report.md"),
    path.join(caseworkRoot, "study", "CASEWORK_REFLECTION_LOOP_V1.md")
  ];

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8");
    assert.match(text, /TTD TESTS Project|Design chat/i, `${path.basename(filePath)} should mention the design/review chat lane`);
    assert.match(text, /Casework GUI/i, `${path.basename(filePath)} should mention Casework GUI`);
    assert.match(text, /Disposable ChatGPT/i, `${path.basename(filePath)} should mention Disposable ChatGPT`);
  }

  const reflectionText = fs.readFileSync(path.join(caseworkRoot, "study", "CASEWORK_REFLECTION_LOOP_V1.md"), "utf8");
  assert.match(reflectionText, /Only then design the next suite\./);
  assert.match(reflectionText, /Mermaid-first review/i);
  assert.match(reflectionText, /case-law matrix/i);
  assert.match(reflectionText, /CASEWORK_STUDY_STATUS\.md/);
  assert.match(reflectionText, /live Orion repo/i);
});
