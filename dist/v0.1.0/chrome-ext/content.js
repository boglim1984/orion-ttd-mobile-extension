const BUILD_VERSION = "0.1.0";
const UPDATED_AT = "2026-06-11T22:05:53.705Z";

const info = {
  name: "Orion TTD Mobile Extension",
  version: BUILD_VERSION,
  flavor: "chrome",
  channel: "orion-ios-github-pages-update",
  updatedAt: UPDATED_AT,
  purpose: "real TTD mobile extension shell; no composer insertion yet"
};

console.log(`[ORION TTD MOBILE] version=${BUILD_VERSION} flavor=chrome`);

window.__ORION_TTD_BUILD__ = BUILD_VERSION;
window.__ORION_TTD_INFO__ = info;
window.__ORION_TTD_SMOKE__ = function __ORION_TTD_SMOKE__() {
  return info;
};
