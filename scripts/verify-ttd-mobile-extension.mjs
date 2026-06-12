import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const UPDATES_DIR = path.join(ROOT_DIR, "updates");
const REPORTS_DIR = path.join(ROOT_DIR, "reports");
const VERSION = "0.1.3";
const ZIP_NAME = `orion-ttd-mobile-extension-chrome-v${VERSION}.zip`;
const ZIP_PATH = path.join(DIST_DIR, `v${VERSION}`, ZIP_NAME);
const MANIFEST_PATH = path.join(DIST_DIR, `v${VERSION}`, "chrome-ext", "manifest.json");
const CONTENT_PATH = path.join(DIST_DIR, `v${VERSION}`, "chrome-ext", "content.js");
const XML_PATH = path.join(UPDATES_DIR, "chrome-updates.xml");
const EXPECTED_URL = `https://boglim1984.github.io/orion-ttd-mobile-extension/dist/v${VERSION}/${ZIP_NAME}`;
const REQUIRED_DATASET_SNIPPETS = [
  'root.dataset.orionTtdBuild = BUILD_VERSION',
  'root.dataset.orionTtdFlavor = "chrome"',
  'root.dataset.orionTtdChannel = CHANNEL',
  'root.dataset.orionTtdLoaded = "true"',
  'root.dataset.orionTtdInfo = JSON.stringify(info)',
  'root.dataset.orionTtdInsertOnlyReady = "true"'
];
const FORBIDDEN_SNIPPETS = [
  "localStorage",
  "sessionStorage",
  "document.cookie",
  "indexedDB",
  "sendButton",
  ".click(",
  "requestSubmit(",
  ".submit(",
  "KeyboardEvent",
  "Authorization",
  "navigator.credentials",
  "chrome.storage"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

fs.mkdirSync(REPORTS_DIR, { recursive: true });

assert(fs.existsSync(ZIP_PATH), `Missing package: ${ZIP_PATH}`);
assert(fs.existsSync(MANIFEST_PATH), `Missing manifest: ${MANIFEST_PATH}`);
assert(fs.existsSync(CONTENT_PATH), `Missing content script: ${CONTENT_PATH}`);
assert(fs.existsSync(XML_PATH), `Missing update XML: ${XML_PATH}`);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
assert(manifest.version === VERSION, `Manifest version mismatch: ${manifest.version}`);

const content = fs.readFileSync(CONTENT_PATH, "utf8");
for (const snippet of REQUIRED_DATASET_SNIPPETS) {
  assert(content.includes(snippet), `Content script missing required dataset write: ${snippet}`);
}
assert(content.includes('document.addEventListener("orion-ttd-run-insert-only-smoke"'), "Content script missing insert-only event listener");
assert(content.includes('mode: "insert_only_no_submit"'), "Content script missing insert-only packet marker");
for (const snippet of FORBIDDEN_SNIPPETS) {
  assert(!content.includes(snippet), `Content script contains forbidden snippet: ${snippet}`);
}

const xml = fs.readFileSync(XML_PATH, "utf8");
assert(xml.includes(`version='${VERSION}'`), "Update XML version mismatch");
assert(xml.includes(EXPECTED_URL), "Update XML codebase mismatch");

const zipListing = execFileSync("unzip", ["-l", ZIP_PATH], { encoding: "utf8" });
assert(zipListing.includes("manifest.json"), "ZIP missing manifest.json");
assert(zipListing.includes("content.js"), "ZIP missing content.js");

const summary = {
  version: VERSION,
  zipPath: ZIP_PATH,
  manifestVersion: manifest.version,
  updateXmlPath: XML_PATH,
  updateUrl: EXPECTED_URL,
  zipContainsManifest: true,
  zipContainsContentScript: true,
  contentContainsDomDatasetStampWrites: true,
  safetyChecksPassed: true,
  verifiedAt: new Date().toISOString()
};

fs.writeFileSync(
  path.join(REPORTS_DIR, "ttd-mobile-extension-v0.1.3-verify.json"),
  JSON.stringify(summary, null, 2)
);

console.log("Verification passed.");
console.log(JSON.stringify(summary, null, 2));
