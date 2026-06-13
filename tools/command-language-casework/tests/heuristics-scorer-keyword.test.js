const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyCaseResult,
  extractObservedKeywords,
  findChunkIdForText
} = require("../lib/casework-heuristics.js");

function makeCaseRecord({
  activeChunkId,
  activeChunkLabel,
  assistantResponses,
  scriptedUserRepliesSent
}) {
  return {
    packet_sent: `TTD_COMMAND_V1\n${JSON.stringify({
      route_id: "desk-reset-v0",
      active_chunk_id: activeChunkId,
      active_chunk_label: activeChunkLabel
    })}`,
    assistant_responses: assistantResponses,
    scripted_user_replies_sent: scriptedUserRepliesSent,
    forbidden_behavior: []
  };
}

test("collect_dishes canonical id counts as expected next chunk from clear_trash move_on", () => {
  const caseRecord = makeCaseRecord({
    activeChunkId: "clear_trash",
    activeChunkLabel: "clear trash",
    assistantResponses: ["New active chunk: collect_dishes."],
    scriptedUserRepliesSent: ["move_on"]
  });

  const observed = extractObservedKeywords(caseRecord);
  const result = classifyCaseResult(caseRecord);

  assert.ok(observed.includes("collect_dishes"));
  assert.equal(result.label, "PASS_CANDIDATE");
});

test("collect dishes human label still counts as expected next chunk", () => {
  const caseRecord = makeCaseRecord({
    activeChunkId: "clear_trash",
    activeChunkLabel: "clear trash",
    assistantResponses: ["New active chunk: collect dishes."],
    scriptedUserRepliesSent: ["move_on"]
  });

  const observed = extractObservedKeywords(caseRecord);
  const result = classifyCaseResult(caseRecord);

  assert.ok(observed.includes("collect_dishes"));
  assert.equal(result.label, "PASS_CANDIDATE");
});

test("transition sentence to canonical next chunk passes", () => {
  const caseRecord = makeCaseRecord({
    activeChunkId: "clear_trash",
    activeChunkLabel: "clear trash",
    assistantResponses: ["Advanced exactly one chunk to collect_dishes."],
    scriptedUserRepliesSent: ["move_on"]
  });

  assert.equal(classifyCaseResult(caseRecord).label, "PASS_CANDIDATE");
});

test("wrong next id still fails route preservation", () => {
  const caseRecord = makeCaseRecord({
    activeChunkId: "clear_trash",
    activeChunkLabel: "clear trash",
    assistantResponses: ["New active chunk: stack_papers."],
    scriptedUserRepliesSent: ["move_on"]
  });

  assert.equal(classifyCaseResult(caseRecord).label, "FAIL_LOST_ROUTE");
});

test("canonical id aliases map to the same chunk", () => {
  assert.equal(findChunkIdForText("desk-reset-v0", "collect_dishes"), "collect_dishes");
  assert.equal(findChunkIdForText("desk-reset-v0", "collect dishes"), "collect_dishes");
});

test("neutral prose with continues does not trigger continue intent", () => {
  const caseRecord = makeCaseRecord({
    activeChunkId: "clear_trash",
    activeChunkLabel: "clear trash",
    assistantResponses: ["The cleanup continues once the route is resumed."],
    scriptedUserRepliesSent: []
  });

  assert.equal(extractObservedKeywords(caseRecord).includes("continue"), false);
});

test("stack_papers canonical id passes when it is the expected next chunk", () => {
  const caseRecord = makeCaseRecord({
    activeChunkId: "collect_dishes",
    activeChunkLabel: "collect dishes",
    assistantResponses: ["New active chunk: stack_papers."],
    scriptedUserRepliesSent: ["move_on"]
  });

  const observed = extractObservedKeywords(caseRecord);
  const result = classifyCaseResult(caseRecord);

  assert.ok(observed.includes("stack_papers"));
  assert.equal(result.label, "PASS_CANDIDATE");
});
