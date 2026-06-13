import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_JS_PATH = path.join(__dirname, "../public/casework-ui.js");
const INDEX_HTML_PATH = path.join(__dirname, "../public/index.html");

test("frontend UI logic has robust validate button wiring", async () => {
  const uiCode = fs.readFileSync(UI_JS_PATH, "utf8");
  const htmlCode = fs.readFileSync(INDEX_HTML_PATH, "utf8");

  // 1. Stable selectors exist in HTML
  assert.match(htmlCode, /id="validate-button"/, "HTML must have #validate-button");
  assert.match(htmlCode, /id="suite-input"/, "HTML must have #suite-input");

  // 2. JS attaches listeners after DOMContentLoaded
  assert.match(uiCode, /document\.addEventListener\("DOMContentLoaded"/, "JS must attach initialization to DOMContentLoaded");

  // 3. Validation sends to /api/validate
  assert.match(uiCode, /postJson\("\/api\/validate"/, "JS must send suite to /api/validate");

  // 4. Validation sends suite_text explicitly
  assert.match(uiCode, /suite_text:/, "JS must send suite_text in body");

  // 5. Validation displays expected visible success string
  assert.match(uiCode, /Valid suite:/, "JS must display 'Valid suite:' on success");

  // 6. Validation displays error string
  assert.match(uiCode, /Validation failed:/, "JS must display 'Validation failed:' on error");
  assert.match(uiCode, /Suite JSON could not be parsed/, "JS should surface parse failures");
  assert.match(uiCode, /unescaped inner packet JSON/, "JS should hint about packet escaping on parse failures");

  // 7. Copy Runner disabled management exists
  assert.match(uiCode, /copySelfContainedButton\.disabled\s*=\s*true/, "JS must disable copy button initially or on edit");
  assert.match(uiCode, /copySelfContainedButton\.disabled\s*=\s*false/, "JS must enable copy button after valid suite");

  // 8. Defensive check exists
  assert.match(uiCode, /const missingControls = \[/, "JS must check for core controls existence");

  // 9. Forbidden behaviors
  assert.doesNotMatch(uiCode, /localStorage|sessionStorage|cookie/, "JS must not use storage");
  assert.doesNotMatch(uiCode, /\/api\/runner\/bootstrap\.js/, "JS must not blindly request bootstrap.js in UI layer");

  // 10. Duplicate declaration check
  const copyStatusMatches = uiCode.match(/const\s+copyStatusButton\s*=/g) || [];
  assert.strictEqual(copyStatusMatches.length, 1, "JS must declare copyStatusButton exactly once");

  // 11. validateButton listener check
  assert.match(uiCode, /validateButton\.addEventListener\("click"/, "JS must have validateButton click listener");

  // 12. Declaration order check (no temporal dead zone)
  const declarationIndex = uiCode.indexOf("const validateButton =");
  const missingControlsIndex = uiCode.indexOf("const missingControls =");
  assert.ok(declarationIndex !== -1, "validateButton must be declared");
  assert.ok(missingControlsIndex !== -1, "missingControls check must exist");
  assert.ok(declarationIndex < missingControlsIndex, "validateButton declaration must appear before missingControls check");

  // 13. Parse check via node
  import("node:child_process").then(({ execSync }) => {
    assert.doesNotThrow(() => {
      execSync(`node --check "${UI_JS_PATH}"`, { stdio: "pipe" });
    }, "JS must pass node --check syntax validation");
  });
});
