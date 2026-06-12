const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyCaseResult
} = require("../lib/casework-heuristics.js");

test("heuristic classifier flags transport confusion as FAIL_NO_ROUTE_ENGAGEMENT", () => {
  const result = classifyCaseResult({
    packet_sent: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"clear_trash\",\"active_chunk_label\":\"clear trash\"}",
    assistant_responses: [
      "This confirms Milestone 7 transport and that the packet reached the composer."
    ],
    scripted_user_replies_sent: [],
    forbidden_behavior: []
  });

  assert.equal(result.label, "FAIL_NO_ROUTE_ENGAGEMENT");
});

test("heuristic classifier marks clear active-chunk preservation as PASS_CANDIDATE", () => {
  const result = classifyCaseResult({
    packet_sent: "TTD_COMMAND_V1\n{\"active_chunk_id\":\"clear_trash\",\"active_chunk_label\":\"clear trash\"}",
    assistant_responses: [
      "Still on clear trash. Do one more small pass and tell me when you're done."
    ],
    scripted_user_replies_sent: [
      "continue"
    ],
    forbidden_behavior: [
      "collect_dishes"
    ]
  });

  assert.equal(result.label, "PASS_CANDIDATE");
});
