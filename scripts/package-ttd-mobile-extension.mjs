import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const UPDATES_DIR = path.join(ROOT_DIR, "updates");
const VERSION = "0.1.1";
const BASE_URL = "https://boglim1984.github.io/orion-ttd-mobile-extension";
const APP_ID = "abcdefghijklmnopqrstuvwxyzabcdef";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const versionDir = path.join(DIST_DIR, `v${VERSION}`);
const buildDir = path.join(versionDir, "chrome-ext");
const zipName = `orion-ttd-mobile-extension-chrome-v${VERSION}.zip`;
const zipPath = path.join(versionDir, zipName);

if (!fs.existsSync(path.join(buildDir, "manifest.json"))) {
  throw new Error(`Missing build output at ${buildDir}. Run build first.`);
}

ensureDir(UPDATES_DIR);
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

execFileSync("zip", ["-r", zipPath, "."], {
  cwd: buildDir,
  stdio: "inherit"
});

const updateXml = `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${APP_ID}'>
    <updatecheck codebase='${BASE_URL}/dist/v${VERSION}/${zipName}' version='${VERSION}' />
  </app>
</gupdate>
`;

fs.writeFileSync(path.join(UPDATES_DIR, "chrome-updates.xml"), updateXml);

console.log(`Packaged ${zipPath}`);
console.log(`Wrote ${path.join(UPDATES_DIR, "chrome-updates.xml")}`);
