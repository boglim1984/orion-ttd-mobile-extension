(function initOrionTtdPacketBuilder(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.OrionTtdPacketBuilder = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function packetBuilderFactory() {
  function createInsertOnlyCommandPacket(overrides = {}) {
    return {
      protocol: "TTD_COMMAND_V1",
      packet_type: "orion_insert_only_smoke",
      source: "orion-ttd-mobile-extension",
      milestone: "7",
      mode: "insert_only_no_submit",
      created_by: "local_extension_test",
      legal_boundary: "composer_insert_only_user_review_required",
      command_id: overrides.command_id || "m7_insert_only_smoke",
      state_version: overrides.state_version || 1,
      session_id: overrides.session_id || "orion-m7-local-session",
      route_id: overrides.route_id || "orion-m7-insert-only-smoke",
      active_goal: overrides.active_goal || "Verify Orion extension can insert a deterministic TTD packet without submit.",
      active_chunk_id: overrides.active_chunk_id || "chunk_00_insert_only_smoke",
      active_chunk_label: overrides.active_chunk_label || "Insert-only command packet smoke",
      chunk_index: overrides.chunk_index || 0,
      phase: overrides.phase || "active",
      allowed_intents: overrides.allowed_intents || ["continue", "pause", "stuck"],
      completion_condition: overrides.completion_condition || "packet_visible_in_composer_without_submit",
      cadence_mode: overrides.cadence_mode || "slow_decision",
      confidence_bias: overrides.confidence_bias || "confirm_if_state_mutating",
      commit_policy: overrides.commit_policy || "proposal_only_reducer_required_no_runtime_commit",
      repair_policy: overrides.repair_policy || "hold_and_reanchor_if_insert_fails",
      safety_gates: overrides.safety_gates || ["insert_only", "no_submit", "user_review_required"],
      page_posture: overrides.page_posture || "composer_insert_only_user_review_required",
      intent: overrides.intent || {
        move: "test_insert",
        summary: "Verify Orion extension can insert a deterministic TTD packet into the ChatGPT composer without submitting."
      }
    };
  }

  function formatInsertOnlyPacket(packet) {
    return `TTD_ORION_POC_V1\n${JSON.stringify(packet, null, 2)}`;
  }

  function buildInsertOnlyPacketText(overrides = {}) {
    return formatInsertOnlyPacket(createInsertOnlyCommandPacket(overrides));
  }

  return {
    createInsertOnlyCommandPacket,
    formatInsertOnlyPacket,
    buildInsertOnlyPacketText
  };
});


(function initOrionTtdComposerFinder(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.OrionTtdComposerFinder = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function composerFinderFactory() {
  const DEFAULT_COMPOSER_SELECTORS = [
    "#prompt-textarea",
    "textarea[data-id='root']",
    "textarea[placeholder*='Message']",
    "textarea",
    "div[contenteditable='true'][id='prompt-textarea']",
    "div[contenteditable='true'][data-testid='prompt-textarea']",
    "div.ProseMirror[contenteditable='true']",
    "div[contenteditable='true'][role='textbox']"
  ];

  function isWritableComposer(element) {
    if (!element || element.disabled || element.readOnly) {
      return false;
    }

    if (typeof element.value === "string") {
      return true;
    }

    const contentEditable = element.isContentEditable || element.getAttribute?.("contenteditable") === "true";
    return Boolean(contentEditable);
  }

  function describeComposer(element) {
    if (!element) {
      return "none";
    }

    const parts = [String(element.tagName || "unknown").toLowerCase()];
    if (element.id) {
      parts.push(`#${element.id}`);
    }
    const testId = element.getAttribute?.("data-testid");
    if (testId) {
      parts.push(`[data-testid="${testId}"]`);
    }
    if (element.getAttribute?.("contenteditable") === "true" || element.isContentEditable) {
      parts.push("[contenteditable=true]");
    }
    return parts.join("");
  }

  function findComposer(documentRef, selectors = DEFAULT_COMPOSER_SELECTORS) {
    const attemptedSelectors = [];

    for (const selector of selectors) {
      attemptedSelectors.push(selector);
      const element = documentRef?.querySelector?.(selector);
      if (isWritableComposer(element)) {
        return {
          found: true,
          element,
          selectorUsed: selector,
          attemptedSelectors,
          composerDescription: describeComposer(element)
        };
      }
    }

    return {
      found: false,
      element: null,
      selectorUsed: null,
      attemptedSelectors,
      composerDescription: "none"
    };
  }

  return {
    DEFAULT_COMPOSER_SELECTORS,
    describeComposer,
    findComposer,
    isWritableComposer
  };
});


(function initOrionTtdWitness(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.OrionTtdWitness = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function witnessFactory(root) {
  const WITNESS_NODE_ID = "orion-ttd-witness";

  function getRootElement(documentRef) {
    return documentRef?.documentElement || null;
  }

  function ensureWitnessNode(documentRef) {
    const existing = documentRef?.querySelector?.(`#${WITNESS_NODE_ID}`);
    if (existing) {
      return existing;
    }

    const node = documentRef?.createElement?.("div");
    if (!node) {
      return null;
    }

    node.id = WITNESS_NODE_ID;
    node.setAttribute?.("hidden", "hidden");
    node.setAttribute?.("aria-hidden", "true");
    if (node.style) {
      node.style.display = "none";
    }

    const container = documentRef?.body || documentRef?.documentElement;
    container?.appendChild?.(node);
    return node;
  }

  function emitOrionTtdWitness(kind, payload = {}, options = {}) {
    const documentRef = options.documentRef || root.document;
    const consoleRef = options.consoleRef || root.console;
    const at = options.at || new Date().toISOString();
    const record = { kind, payload, at };
    const serializedRecord = JSON.stringify(record);

    consoleRef?.info?.("[ORION_TTD]", serializedRecord);

    const pageRoot = getRootElement(documentRef);
    if (pageRoot?.dataset) {
      pageRoot.dataset.orionTtdLastWitness = serializedRecord;
      pageRoot.dataset.orionTtdLastWitnessKind = kind;
      pageRoot.dataset.orionTtdLastWitnessAt = at;
    }

    const node = ensureWitnessNode(documentRef);
    if (node) {
      node.textContent = serializedRecord;
    }

    return {
      record,
      serializedRecord,
      node
    };
  }

  return {
    WITNESS_NODE_ID,
    emitOrionTtdWitness
  };
});


(function initOrionTtdInsertOnly(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.OrionTtdInsertOnly = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function insertOnlyFactory(root) {
  const packetBuilder = root.OrionTtdPacketBuilder || require("./packet-builder.js");
  const composerFinder = root.OrionTtdComposerFinder || require("./composer-finder.js");
  const witness = root.OrionTtdWitness || require("./witness.js");

  function getRootElement(documentRef) {
    return documentRef?.documentElement || null;
  }

  function writeDatasetStatus(documentRef, result) {
    const pageRoot = getRootElement(documentRef);
    if (!pageRoot) {
      return;
    }

    pageRoot.dataset.orionTtdInsertOnlyLastResult = JSON.stringify({
      ok: result.ok,
      selectorUsed: result.selectorUsed,
      blockedReason: result.blockedReason || null,
      submitAttempted: result.submitAttempted,
      composerKind: result.composerKind || null
    });
    pageRoot.dataset.orionTtdInsertOnlyLastSelector = result.selectorUsed || "";
    pageRoot.dataset.orionTtdInsertOnlyLastOk = result.ok ? "true" : "false";
  }

  function summarizePacketText(packetText) {
    return {
      packetPrefix: packetText.slice(0, 32),
      packetLength: packetText.length
    };
  }

  function emitWitness(documentRef, consoleRef, kind, payload) {
    return witness.emitOrionTtdWitness(kind, payload, {
      documentRef,
      consoleRef
    });
  }

  function createEventFactory(documentRef) {
    const view = documentRef?.defaultView || root;
    return {
      createInputEvent(type, value) {
        if (typeof view?.InputEvent === "function") {
          return new view.InputEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            data: value,
            inputType: "insertText"
          });
        }
        if (typeof view?.Event === "function") {
          const fallback = new view.Event(type, {
            bubbles: true,
            cancelable: true,
            composed: true
          });
          fallback.data = value;
          return fallback;
        }
        return { type };
      },
      createChangeEvent() {
        if (typeof view?.Event === "function") {
          return new view.Event("change", {
            bubbles: true,
            cancelable: true,
            composed: true
          });
        }
        return { type: "change" };
      }
    };
  }

  function getExistingComposerText(element) {
    if (!element) {
      return "";
    }
    if (typeof element.value === "string") {
      return element.value;
    }
    return element.textContent || "";
  }

  function setComposerText(element, packetText) {
    if (typeof element.value === "string") {
      element.value = packetText;
      if (typeof element.setSelectionRange === "function") {
        element.setSelectionRange(packetText.length, packetText.length);
      }
      return "textarea";
    }

    element.textContent = packetText;
    return "contenteditable";
  }

  function dispatchComposerEvents(element, packetText, documentRef) {
    const events = createEventFactory(documentRef);
    element.dispatchEvent?.(events.createInputEvent("beforeinput", packetText));
    element.dispatchEvent?.(events.createInputEvent("input", packetText));
    element.dispatchEvent?.(events.createChangeEvent());
  }

  function runInsertOnlySmoke(options = {}) {
    const documentRef = options.documentRef || root.document;
    const consoleRef = options.consoleRef || root.console;
    const allowOverwrite = Boolean(options.allowOverwrite);
    const packetText = options.packetText || packetBuilder.buildInsertOnlyPacketText(options.packetOverrides);
    const packetSummary = summarizePacketText(packetText);

    emitWitness(documentRef, consoleRef, "insert_only_smoke_started", {
      allowOverwrite,
      targetSelector: options.targetSelector || null,
      ...packetSummary
    });

    const locatedComposer = options.targetElement
      ? {
          found: true,
          element: options.targetElement,
          selectorUsed: options.targetSelector || "__direct_target__",
          attemptedSelectors: options.targetSelector ? [options.targetSelector] : ["__direct_target__"],
          composerDescription: composerFinder.describeComposer(options.targetElement)
        }
      : composerFinder.findComposer(documentRef, options.selectors);

    if (!locatedComposer.found) {
      const result = {
        ok: false,
        selectorUsed: null,
        attemptedSelectors: locatedComposer.attemptedSelectors,
        blockedReason: "composer_not_found",
        submitAttempted: false
      };
      writeDatasetStatus(documentRef, result);
      emitWitness(documentRef, consoleRef, "insert_only_smoke_result", {
        ok: result.ok,
        selectorUsed: result.selectorUsed,
        blockedReason: result.blockedReason,
        submitAttempted: result.submitAttempted,
        composerKind: null,
        ...packetSummary
      });
      return result;
    }

    const existingText = getExistingComposerText(locatedComposer.element);
    if (!allowOverwrite && existingText.trim()) {
      const result = {
        ok: false,
        selectorUsed: locatedComposer.selectorUsed,
        attemptedSelectors: locatedComposer.attemptedSelectors,
        composerDescription: locatedComposer.composerDescription,
        blockedReason: "composer_not_empty",
        existingLength: existingText.length,
        submitAttempted: false
      };
      writeDatasetStatus(documentRef, result);
      emitWitness(documentRef, consoleRef, "insert_only_smoke_result", {
        ok: result.ok,
        selectorUsed: result.selectorUsed,
        blockedReason: result.blockedReason,
        submitAttempted: result.submitAttempted,
        composerKind: null,
        ...packetSummary
      });
      return result;
    }

    try {
      locatedComposer.element.focus?.();
      const composerKind = setComposerText(locatedComposer.element, packetText);
      dispatchComposerEvents(locatedComposer.element, packetText, documentRef);

      const result = {
        ok: true,
        selectorUsed: locatedComposer.selectorUsed,
        attemptedSelectors: locatedComposer.attemptedSelectors,
        composerDescription: locatedComposer.composerDescription,
        composerKind,
        packetText,
        insertedLength: packetText.length,
        submitAttempted: false
      };
      writeDatasetStatus(documentRef, result);
      emitWitness(documentRef, consoleRef, "insert_only_smoke_result", {
        ok: result.ok,
        selectorUsed: result.selectorUsed,
        blockedReason: result.blockedReason || null,
        submitAttempted: result.submitAttempted,
        composerKind: result.composerKind || null,
        ...packetSummary
      });
      return result;
    } catch (error) {
      const result = {
        ok: false,
        selectorUsed: locatedComposer.selectorUsed,
        attemptedSelectors: locatedComposer.attemptedSelectors,
        composerDescription: locatedComposer.composerDescription,
        blockedReason: "insert_only_runtime_error",
        submitAttempted: false
      };
      writeDatasetStatus(documentRef, result);
      emitWitness(documentRef, consoleRef, "insert_only_smoke_error", {
        message: error?.message || "unknown_error",
        selectorUsed: locatedComposer.selectorUsed || null,
        ...packetSummary
      });
      return result;
    }
  }

  return {
    runInsertOnlySmoke
  };
});


const BUILD_VERSION = "0.1.3";
const UPDATED_AT = "2026-06-12T18:51:48.085Z";
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
