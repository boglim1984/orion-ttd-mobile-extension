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
