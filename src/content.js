const BUILD_VERSION = "__BUILD_VERSION__";
const UPDATED_AT = "__UPDATED_AT__";
const CHANNEL = "orion-ios-github-pages-update";

const info = {
  name: "Orion TTD Mobile Extension",
  version: BUILD_VERSION,
  flavor: "chrome",
  channel: CHANNEL,
  updatedAt: UPDATED_AT,
  purpose: "insert-only Orion command packet smoke; manual trigger only; no submit behavior"
};

console.log(`[ORION TTD MOBILE] version=${BUILD_VERSION} flavor=chrome`);

const root = document.documentElement;
if (root) {
  root.dataset.orionTtdBuild = BUILD_VERSION;
  root.dataset.orionTtdFlavor = "chrome";
  root.dataset.orionTtdChannel = CHANNEL;
  root.dataset.orionTtdLoaded = "true";
  root.dataset.orionTtdInfo = JSON.stringify(info);
  root.dataset.orionTtdInsertOnlyReady = "true";
  root.dataset.orionTtdInsertOnlyMode = "manual_trigger_only";
}

function runInsertOnlySmokeFromEvent(detail = {}) {
  if (!globalThis.OrionTtdInsertOnly) {
    return {
      ok: false,
      blockedReason: "insert_only_runtime_missing",
      submitAttempted: false
    };
  }

  return globalThis.OrionTtdInsertOnly.runInsertOnlySmoke({
    packetOverrides: detail.packetOverrides,
    allowOverwrite: detail.allowOverwrite,
    targetSelector: detail.targetSelector
  });
}

document.addEventListener("orion-ttd-run-insert-only-smoke", (event) => {
  const result = runInsertOnlySmokeFromEvent(event.detail || {});
  root.dataset.orionTtdInsertOnlyLastEventResult = JSON.stringify({
    ok: result.ok,
    blockedReason: result.blockedReason || null,
    selectorUsed: result.selectorUsed || null
  });
});

window.__ORION_TTD_BUILD__ = BUILD_VERSION;
window.__ORION_TTD_INFO__ = info;
window.__ORION_TTD_SMOKE__ = function __ORION_TTD_SMOKE__() {
  return info;
};
window.__ORION_TTD_INSERT_ONLY_SMOKE__ = function __ORION_TTD_INSERT_ONLY_SMOKE__(options) {
  return runInsertOnlySmokeFromEvent(options || {});
};
