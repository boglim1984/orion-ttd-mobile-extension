(function initOrionTtdInsertOnly(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.OrionTtdInsertOnly = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function insertOnlyFactory(root) {
  const packetBuilder = root.OrionTtdPacketBuilder || require("./packet-builder.js");
  const composerFinder = root.OrionTtdComposerFinder || require("./composer-finder.js");

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
    const allowOverwrite = Boolean(options.allowOverwrite);
    const packetText = options.packetText || packetBuilder.buildInsertOnlyPacketText(options.packetOverrides);
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
      return result;
    }

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
    return result;
  }

  return {
    runInsertOnlySmoke
  };
});
