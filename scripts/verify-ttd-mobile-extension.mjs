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
const VERSION = "0.1.0";
const ZIP_NAME = `orion-ttd-mobile-extension-chrome-v${VERSION}.zip`;
const ZIP_PATH = path.join(DIST_DIR, `v${VERSION}`, ZIP_NAME);
const MANIFEST_PATH = path.join(DIST_DIR, `v${VERSION}`, "chrome-ext", "manifest.json");
const XML_PATH = path.join(UPDATES_DIR, "chrome-updates.xml");
const EXPECTED_URL = `https://boglim1984.github.io/orion-ttd-mobile-extension/dist/v${VERSION}/${ZIP_NAME}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

fs.mkdirSync(REPORTS_DIR, { recursive: true });

assert(fs.existsSync(ZIP_PATH), `Missing package: ${ZIP_PATH}`);
assert(fs.existsSync(MANIFEST_PATH), `Missing manifest: ${MANIFEST_PATH}`);
assert(fs.existsSync(XML_PATH), `Missing update XML: ${XML_PATH}`);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
assert(manifest.version === VERSION, `Manifest version mismatch: ${manifest.version}`);

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
  verifiedAt: new Date().toISOString()
};

fs.writeFileSync(
  path.join(REPORTS_DIR, "ttd-mobile-extension-v0.1.0-verify.json"),
  JSON.stringify(summary, null, 2)
);

console.log("Verification passed.");
console.log(JSON.stringify(summary, null, 2));
