import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT_DIR, "src");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const VERSION = "0.1.1";
const UPDATED_AT = new Date().toISOString();

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function replaceTokens(input) {
  return input
    .replace(/__BUILD_VERSION__/g, VERSION)
    .replace(/__UPDATED_AT__/g, UPDATED_AT);
}

ensureDir(DIST_DIR);

const buildDir = path.join(DIST_DIR, `v${VERSION}`, "chrome-ext");
ensureDir(buildDir);

const contentTemplate = fs.readFileSync(path.join(SRC_DIR, "content.js"), "utf8");
const manifestTemplate = fs.readFileSync(path.join(SRC_DIR, "manifest.chrome.json"), "utf8");

fs.writeFileSync(path.join(buildDir, "content.js"), replaceTokens(contentTemplate));
fs.writeFileSync(path.join(buildDir, "manifest.json"), replaceTokens(manifestTemplate));
fs.writeFileSync(
  path.join(DIST_DIR, `v${VERSION}`, "build-info.json"),
  JSON.stringify(
    {
      name: "Orion TTD Mobile Extension",
      version: VERSION,
      flavor: "chrome",
      channel: "orion-ios-github-pages-update",
      updatedAt: UPDATED_AT,
      purpose: "real TTD mobile extension shell; page-visible DOM build stamp; no composer insertion yet"
    },
    null,
    2
  )
);

console.log(`Built Orion TTD Mobile Extension v${VERSION} at ${buildDir}`);
