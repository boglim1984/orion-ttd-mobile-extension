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
