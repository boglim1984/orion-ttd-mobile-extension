# Milestone 6 Preflight Reducer Comparison

Date: 2026-06-11
Repo: `/Users/oflahertys/Code Projects/ACTIVE/orion-ios-ttd-injector/ttd-mobile-extension`
Scope: report-only preflight for Milestone 6 reducer work

## Mission Boundary

This pass does not add reducer code, scorer code, runtime extension changes, version metadata changes, or Command Center edits.

It only compares:

- Orion Milestone 5 docs and workflow fixtures
- older TTD reducer-like logic from `voice-plugin-expansion`
- advanced Skill Injector design-stage docs and modules
- the later reduced Skill Dump / injection-infrastructure lane where relevant

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

### Advanced Skill Injector design stage

- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_PACKET_VALIDATOR.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_FRONT_DOOR.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_STATE_CONTEXT_PROTOCOL.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_CONTROL_PROTOCOL.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/A2UI_FOOTER_RENDERER.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/MESSAGING_PROTOCOL.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/AI_EDIT_COMMAND_REGISTRY.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/docs/ARCHITECTURE.md`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/ai-edit-command-registry.js`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/ai-edit-operator-manual.js`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/ai-edit-front-door.js`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/skill-operation-protocol.js`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/command-output-parser.js`
- `/Users/oflahertys/Desktop/Code Projects/ACTIVE/chatgpt-skill-injector-extension/site-adapter-profiles.js`

## Executive Verdict

Milestone 6 should reuse patterns, not implementations.

Older TTD contains real reducer-adjacent state logic, but it is organized around a smoke harness, an apply endpoint, and an offline runtime with a narrower session/chunk model than Orion now requires. It is useful as precedent for transition guards, session/event validation, fixture-first testing, and re-anchor packet discipline. It is not a drop-in Orion reducer.

The earlier advanced Skill Injector design is more important than the later reduced Skill Dump lane. It was not merely injection infrastructure. It was aiming at a state-aware control plane with:

- a compact current-state protocol
- legal-move surfacing
- proposal vs approval vs mutation taxonomy
- parser and packet validation boundaries
- front-door routing
- review-chain artifacts
- explicit authority separation between LLM output and extension-committed state

That still does not make Skill Injector the Orion reducer source. It does make it a strong source for Milestone 6 terminology, guard structure, audit-record shape, and proposal/commit separation.

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

## What Advanced Skill Injector Actually Has

Skill Injector and Skill Dump should not be collapsed into the same thing.

Observed concrete behavior:

- `AI_EDIT_STATE_CONTEXT_PROTOCOL.md` defines a compact state object with branch, step, legal moves, constraints, freshness, and explicit transition-proposal / dry-run result shapes.
- `AI_EDIT_CONTROL_PROTOCOL.md` frames the system as an LLM-to-extension control plane with separate control-command and skill-body streams, explicit state-machine authority, and validation before any accepted command.
- `MESSAGING_PROTOCOL.md` defines a message taxonomy that separates `proposal`, `dry_run_request`, `approval_request`, `mutation_intent`, and their result categories before any live mutation exists.
- `AI_EDIT_COMMAND_REGISTRY.md` and `ai-edit-command-registry.js` define an allowlisted command graph with stable IDs, required preconditions, allowed effects, forbidden effects, and allowlisted next transitions.
- `AI_EDIT_PACKET_VALIDATOR.md` repeatedly states that the validator is a gate, not an executor.
- `AI_EDIT_FRONT_DOOR.md` and `ai-edit-front-door.js` define a real front-door routing model plus a small debug-state reducer for menu, review-only, and operator-payload activity.
- `A2UI_FOOTER_RENDERER.md` defines a multi-stage review chain: legal move surface, move-intent review, transition proposal review, dry-run plan card, approval review, and review-chain checkpoint.
- `ai-edit-operator-manual.js` explicitly states: current state plus validator plus dry-run plus explicit approval gate are authority; natural language and structured packets are not authority.
- `command-output-parser.js` shows a concrete sentinel parser with boundary markers, packet summaries, duplicate detection, malformed-packet handling, and non-authoritative parse status.
- `site-adapter-profiles.js` shows strong injection and safety invariants: `noAutoExecute`, `noAutoSubmit`, and `noComposerInsertFromPassiveObservation`.

Implication:

- Advanced Skill Injector was trying to be a review-first, validator-gated, LLM-mediated control system with explicit local authority boundaries.
- It was closer to an edit/review/commit architecture and local control protocol than to a simple injection helper.
- It is still not the source of truth for Orion route/chunk transitions, but it is highly relevant to how Orion should structure reducer-adjacent packets, validation, and audit surfaces.

## What The Later Skill Dump Lane Represents

The later reduced Skill Dump lane is the narrower infrastructure residue:

- composer insertion
- site adapters
- delivery plumbing
- GitHub-local skill transport concerns

That reduced lane is useful mainly for safety and injection boundaries. It is not the main design source for Orion state logic.

## Amendment - Advanced Skill Injector Design Stage

### Why Skill Injector is distinct from Skill Dump

Skill Injector was the broader design stage.

It was aiming at:

- a local-first LLM control surface
- a proposal/review/approval architecture
- a validator-gated command protocol
- state-aware routing with legal moves and blocked moves
- explicit separation between visible review artifacts and durable mutation

Skill Dump is the later reduction of that vision toward injection infrastructure and delivery plumbing. It should not be treated as the full architectural source.

### Advanced Skill Injector patterns found

- Compact state-context packets with branch, step, legal moves, freshness, and constraints
- Intent codes that are signals, not authority
- Transition-proposal and dry-run result shapes that stay review-only until later approval
- Stable command IDs and allowlisted next transitions
- Separate parser, validator, router, review surface, and eventual mutation lanes
- Explicit message categories for proposal, dry-run, approval, and mutation intent
- A review-chain checkpoint concept for stale-state and alignment auditing
- A small reducer-like debug-state pattern in `ai-edit-front-door.js` that records decisions without granting mutation authority

### Patterns relevant to Orion reducer design

- Proposal vs commit separation should be first-class in Orion terminology
- Orion reducer input should be normalized packet/state data, not raw assistant prose
- Orion can benefit from a compact audit record shape: source, validated intent, state sequence or session identity, guard result, reducer effect, stale/blocked reason
- Legal-move and blocked-move language maps well to Orion allowed-intent and refusal handling
- Freshness/staleness checks from Skill Injector are a good model for Orion `session_id`, route identity, and one-turn validity guards
- Allowlisted transitions and required preconditions are a good model for Orion guard naming and reducer refusal reasons

### Patterns not relevant to Orion reducer design

- UI-heavy A2UI footer layering is too broad for Orion v0 reducer work
- Chrome/ChatGPT composer insertion is not Orion state authority
- Selected-skill and skill-body editing lanes are domain-specific to Skill Injector
- Workbench, Git review, and local skill-file operations are not Orion reducer responsibilities

### Corrected comparison against TTD and Orion Milestone 5

Older TTD remains the stronger source for route/chunk transition precedent.

Advanced Skill Injector is the stronger source for:

- protocol vocabulary
- proposal/review/approval separation
- packet validation boundaries
- audit-trace structure
- intent routing before mutation

Orion Milestone 5 remains the primary implementation contract because it already defines:

- the actual route/chunk semantics
- the `done` vs `move_on` rule
- interruption/recovery expectations
- the fixture baseline

The corrected view is:

- older TTD informs transition and session safety patterns
- advanced Skill Injector informs control-plane and validation architecture
- Orion Milestone 5 defines the reducer contract that must actually be implemented

### Updated Milestone 6 recommendations

- Keep the Milestone 6 reducer pure and Orion-native
- Add explicit normalized intent validation ahead of reducer application
- Name reducer refusals and guards clearly, closer to the Skill Injector validator style
- Produce compact reducer audit summaries rather than relying on prose or UI interpretation
- Keep any future footer or review artifacts downstream from reducer truth, never upstream of it
- Do not import Skill Injector’s UI layers, but do borrow its proposal/review/approval vocabulary where it sharpens Orion docs and tests

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

### Reuse from advanced Skill Injector

- Strict separation between parser/validator/review UI and authoritative reducer
- No-auto-execute and no-auto-submit safety invariants
- Front-door style intent classification when routing side questions, repair flows, and future context requests
- Stable packet/category vocabulary for proposal, dry-run, approval, and blocked/refusal states
- Allowlisted transition/precondition style from the command registry and state-context protocol
- Compact audit and freshness concepts such as state sequence, stale detection, and review-only artifacts
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

### From advanced Skill Injector / later Skill Dump lane

- Review packets as transition authority
- Chat-composer insertion flows as reducer inputs
- Any storage or UI flow that blurs state review and state mutation
- The full UI-heavy A2UI review chain as a Milestone 6 implementation dependency
- Any assumption that chat/composer context is durable Orion route memory

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
- explicit pre-reducer validation boundary for malformed, stale, out-of-route, or disallowed intent packets
- fixture-first verification against Milestone 5 workflow files before any richer runtime wiring

Recommended non-goals for first implementation:

- no scorer
- no runtime DOM mutation logic
- no UI review authority
- no legacy compiler abstraction imported whole from older TTD
- no import of the Skill Injector front-door or A2UI stack as runtime dependency

## Final Recommendation

Milestone 6 should be implemented as a new Orion-native reducer that borrows:

- older TTD transition and refusal safety patterns
- advanced Skill Injector protocol, validation, and proposal/commit separation patterns
- Orion Milestone 5 fixture semantics as the actual reducer contract

The earlier report’s strongest correction is this: Skill Dump is not the reducer source, but the earlier advanced Skill Injector design is a meaningful design source for reducer-adjacent architecture.

The biggest immediate win before coding is a short doc/fixture alignment pass around `active_chunk_id` naming and terminal-route completion semantics. After that, the current Milestone 5 material is sufficient to start reducer implementation cleanly.
