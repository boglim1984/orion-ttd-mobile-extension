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
