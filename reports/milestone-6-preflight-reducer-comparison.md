# Milestone 6 Preflight Reducer Comparison

Date: 2026-06-11
Repo: `/Users/oflahertys/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension`
Scope: report-only preflight for Milestone 6 reducer work

## Mission Boundary

This pass does not add reducer code, scorer code, runtime extension changes, version metadata changes, or Command Center edits.

It only compares:

- Orion Milestone 5 docs and workflow fixtures
- older TTD reducer-like logic from `voice-plugin-expansion`
- Skill Dump / injector extension state, parser, and injection patterns

## Sources Inspected

### Orion extension repo

- `ttdmobile_coding_rulebook.md`
- `docs/ORION_TTD_COMMAND_PROTOCOL_V0.md`
- `docs/ORION_TTD_REDUCTION_HARNESS_V0.md`
- `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
- `docs/ORION_TTD_SMARTNESS_BUDGET_V0.md`
- `docs/ORION_TTD_MERMAID_PLANNING_RULE_V0.md`
- `reports/milestone-5-reduction-harness-design-report.md`
- `test-fixtures/workflows/desk-reset-v0.json`
- `test-fixtures/workflows/side-question-return-v0.json`
- `test-fixtures/workflows/recover-turn-v0.json`
- `fail-recover-map/README.md`

### Older TTD / voice-plugin-expansion

- `/Users/oflahertys/Code Projects/voice-plugin-expansion/ttd-watcher/src/compiler.js`
- `/Users/oflahertys/Code Projects/voice-plugin-expansion/ttd-watcher/src/ttd_apply_intent_endpoint_v1.js`
- `/Users/oflahertys/Code Projects/voice-plugin-expansion/ttd-watcher/test/ttd_text_smoke_harness_v1.test.js`
- `/Users/oflahertys/Code Projects/voice-plugin-expansion/docs/TTD_TEMPORAL_REANCHOR_PACKET_V0.md`

### Skill Dump / injector extension

- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_PACKET_VALIDATOR.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_FRONT_DOOR.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/site-adapter-profiles.js`

## Executive Verdict

Milestone 6 should reuse patterns, not implementations.

Older TTD contains real reducer-adjacent state logic, but it is organized around a smoke harness, an apply endpoint, and an offline runtime with a narrower session/chunk model than Orion now requires. It is useful as precedent for transition guards, session/event validation, fixture-first testing, and re-anchor packet discipline. It is not a drop-in Orion reducer.

Skill Dump contains strong safety and injection architecture, but it is explicitly review-only and non-authoritative. It should inform how Orion separates parser/validator/insertion boundaries from reducer authority, but it should not be treated as route-state logic.

## What Older TTD Actually Has

Older TTD is not just scaffolding.

Observed concrete behavior:

- `ttd_apply_intent_endpoint_v1.js` validates `session_id`, `event_id`, `intent`, `state_file_path`, and rejects forbidden fields.
- Allowed intents there are already close to Orion: `done`, `stuck`, `continue`, `move_on`, `pause`, `re_chunk`.
- The handler refuses state application on `SESSION_ID_MISMATCH`.
- `ttd_text_smoke_harness_v1.test.js` verifies that malformed or mismatched packets do not mutate persisted state.
- The same test suite explicitly verifies that `move_on` advances the chunk through compiler/runtime handling and that the reducer never directly receives raw `move_on`.
- `TTD_TEMPORAL_REANCHOR_PACKET_V0.md` shows a concrete re-anchor packet with route ID, session ID, boundary, current chunk index, active chunk, previous chunk, allowed responses, and artifact-permission discipline.

Implication:

- Older TTD already proved the value of narrow intent vocabularies, idempotent refusal, re-anchor packets, and explicit state summaries.
- But its state shape is smaller and more runtime-specific than Orion’s Milestone 5 design.
- It also couples some transition handling to runtime/compiler plumbing that Orion should keep cleaner and more directly fixture-driven.

## What Skill Dump Actually Has

Skill Dump is not a reducer source.

Observed concrete behavior:

- `AI_EDIT_PACKET_VALIDATOR.md` repeatedly states that the validator is a gate, not an executor.
- Its authority model is explicit: LLM proposes, Billy authorizes, extension validates and commits, persistence happens later.
- `AI_EDIT_FRONT_DOOR.md` states that move-intent packets are review artifacts only and do not authorize transitions or mutate state.
- `site-adapter-profiles.js` shows strong injection and safety invariants: `noAutoExecute`, `noAutoSubmit`, and `noComposerInsertFromPassiveObservation`.

Implication:

- Skill Dump is useful for front-door routing, parser/validator layering, and safe composer-insertion boundaries.
- It is not useful as the source of truth for Orion route/chunk state transitions.
- Orion should keep Skill Dump’s non-authoritative UI review stance and avoid letting footer packets become state authority.

## Orion Milestone 5 Readiness

Milestone 5 already defines the right authority model for Milestone 6:

- reducer state is authoritative
- assistant footer artifacts are proposals only
- `done` completes but does not advance
- `move_on` advances exactly one chunk
- route restoration after interruption is explicit
- fixture coverage is supposed to anchor reducer behavior

The current docs and fixtures are strong enough to start reducer coding after one short cleanup pass on naming and terminal assertions.

## Reuse Recommendations

### Reuse from older TTD

- Session and event identity guards before any mutation
- Refusal on malformed payloads without touching persisted state
- Fixture-first smoke-harness mindset
- Re-anchor packet structure after accepted movement boundaries
- Explicit allowed-intent set rather than open natural-language control
- Clear state summaries for audit/debug output

### Reuse from Skill Dump

- Strict separation between parser/validator/review UI and authoritative reducer
- No-auto-execute and no-auto-submit safety invariants
- Front-door style intent classification when routing side questions or repair flows later
- Site-adapter / injector caution: runtime insertion should remain a separate layer from state logic

### Reuse from Orion Milestone 5 as the primary source

- Orion state vocabulary: `route_id`, `active_goal`, `active_chunk_id`, `chunk_index`, `phase`, `allowed_intents`, `cadence_mode`, `confidence_bias`, `repair_count`
- Orion meaning of `done` vs `move_on`
- Orion fail/recover map as future failure taxonomy
- Orion workflow fixtures as the reducer contract baseline

## Do Not Reuse As-Is

### From older TTD

- The exact compiler/runtime split where `move_on` is translated outside the reducer path
- The smaller legacy state shape as Orion’s state model
- Any assumption that a text-smoke harness structure is itself the best final reducer architecture

### From Skill Dump

- Review packets as transition authority
- Chat-composer insertion flows as reducer inputs
- Any storage or UI flow that blurs state review and state mutation

## Pre-Milestone-6 Fixes To Make Before Coding

These are report findings only. They are not changed in this pass.

1. State-field naming should be normalized.
   Orion docs commonly use `active_chunk_id`, while current workflow fixtures still store live state as `active_chunk`. Expected assertions already use `expected_active_chunk_id`. Milestone 6 code should not start until the canonical state field name is chosen and documented.

2. Final route completion policy should be made explicit in the desk-reset fixture.
   `test-fixtures/workflows/desk-reset-v0.json` ends with final-chunk `done` holding `chunk_05_choose_next_work_item`, but it does not explicitly say whether the route is complete at that point or whether a separate terminal commit is still required. Milestone 6 needs one unambiguous rule here.

3. Allowed-intent documentation should stay synchronized across fixture types.
   Interruption fixtures use `return_to_route`, while the older TTD logic only carried the narrower set around `done/stuck/continue/move_on/pause/re_chunk`. That is fine, but Orion docs should keep `return_to_route` explicitly first-class wherever the reducer contract is summarized.

4. Build-stamp verification language should continue to avoid implying window-global runtime markers as the preferred verification path.
   The safer visible-page verification posture is the DOM-observable stamp path already established elsewhere in the extension work.

## Recommended Milestone 6 Posture

Build a small pure Orion reducer first.

Recommended shape:

- pure input: current authoritative Orion state plus normalized interpreted intent packet
- pure output: next authoritative state plus explicit reducer effect summary
- hard guards for `session_id`, route identity, legal intents, and one-active-chunk invariants
- fixture-first verification against Milestone 5 workflow files before any richer runtime wiring

Recommended non-goals for first implementation:

- no scorer
- no runtime DOM mutation logic
- no UI review authority
- no legacy compiler abstraction imported whole from older TTD

## Final Recommendation

Milestone 6 should be implemented as a new Orion-native reducer that borrows older TTD safety patterns and Skill Dump boundary discipline, but not their concrete architecture as the state source of truth.

The biggest immediate win before coding is a short doc/fixture alignment pass around `active_chunk_id` naming and terminal-route completion semantics. After that, the current Milestone 5 material is sufficient to start reducer implementation cleanly.
