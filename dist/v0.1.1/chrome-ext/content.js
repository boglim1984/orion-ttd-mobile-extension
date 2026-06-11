const BUILD_VERSION = "0.1.1";
const UPDATED_AT = "2026-06-11T22:36:27.749Z";
const CHANNEL = "orion-ios-github-pages-update";

const info = {
  name: "Orion TTD Mobile Extension",
  version: BUILD_VERSION,
  flavor: "chrome",
  channel: CHANNEL,
  updatedAt: UPDATED_AT,
  purpose: "real TTD mobile extension shell; page-visible DOM build stamp; no composer insertion yet"
};

console.log(`[ORION TTD MOBILE] version=${BUILD_VERSION} flavor=chrome`);

const root = document.documentElement;
if (root) {
  root.dataset.orionTtdBuild = BUILD_VERSION;
  root.dataset.orionTtdFlavor = "chrome";
  root.dataset.orionTtdChannel = CHANNEL;
  root.dataset.orionTtdLoaded = "true";
  root.dataset.orionTtdInfo = JSON.stringify(info);
}

window.__ORION_TTD_BUILD__ = BUILD_VERSION;
window.__ORION_TTD_INFO__ = info;
window.__ORION_TTD_SMOKE__ = function __ORION_TTD_SMOKE__() {
  return info;
};
