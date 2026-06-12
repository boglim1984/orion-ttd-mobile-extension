const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildInsertOnlyPacketText,
  createInsertOnlyCommandPacket
} = require("../../src/content/packet-builder.js");

test("packet builder emits deterministic insert-only command packet", () => {
  const packet = createInsertOnlyCommandPacket();
  assert.equal(packet.protocol, "TTD_COMMAND_V1");
  assert.equal(packet.mode, "insert_only_no_submit");
  assert.equal(packet.command_id, "m7_insert_only_smoke");
  assert.equal(packet.page_posture, "composer_insert_only_user_review_required");

  const text = buildInsertOnlyPacketText();
  assert.match(text, /^TTD_ORION_POC_V1\n\{/);
  assert.match(text, /"packet_type": "orion_insert_only_smoke"/);
  assert.match(text, /"mode": "insert_only_no_submit"/);
});
