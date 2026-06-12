# Orion TTD Reduction Harness V0

Status: Milestone 5 design artifact  
Scope: reducer/invariant architecture only

## Purpose

Define the local authority layer that sits between:

- user signals;
- extension observation/actuation;
- packet memory;
- assistant proposals;
- repair logic;
- workflow test scoring.

The harness should be dumb by default, smart at the boundary, and audited after every transition.

## Reducer authority

The reducer is the only layer allowed to commit state transitions.

The reducer may:

- accept a legal transition;
- reject an illegal proposal;
- emit a repair requirement;
- hold state unchanged;
- mark chunk complete;
- mark route complete after legal terminal conditions.

The reducer may not:

- trust assistant prose as committed state;
- infer hidden progress;
- auto-upgrade unsupported intents;
- allow runtime surfaces to mutate state directly.

## State shape

Minimum reducer state:

- `session_id`
- `state_version`
- `route_id`
- `active_goal`
- `route_status`
- `active_chunk_id`
- `active_chunk_label`
- `chunk_index`
- `chunks`
- `allowed_intents`
- `phase`
- `last_committed_action`
- `last_event_id`
- `cadence_mode`
- `confidence_bias`
- `ambiguity_count`
- `repair_count`
- `pending_recovery`
- `parked_side_questions`
- `completion_condition`

Optional state:

- `partial_progress`
- `paused_reason`
- `hold_reason`
- `recent_signals`
- `metrics_snapshot`

## Signals

Signals are inputs to the reducer, not state authority.

Signal classes:

- `user_text_intent`
- `assistant_footer_proposal`
- `page_observer_signal`
- `recovery_signal`
- `manual_test_event`
- `workflow_fixture_event`

Surface examples:

- typed user reply
- side question
- dataset build stamp
- task-return token
- voice/Shortcut/email return surface

Voice Mode, task DOM, email, and Shortcut remain signal/action surfaces only, not state authority.

## Guards

Guards are deterministic checks run before state mutation.

Core guards:

- `state_version_guard`
- `command_id_guard`
- `allowed_intent_guard`
- `done_vs_move_on_guard`
- `single_active_chunk_guard`
- `no_invented_progress_guard`
- `stale_event_guard`
- `event_dedupe_guard`
- `side_question_return_guard`
- `composer_occupied_guard`
- `pending_recovery_guard`
- `terminal_commit_guard`
- `autonomy_scope_gate`

## Actions

Reducer output actions:

- `commit`
- `reject`
- `repair`
- `hold`
- `complete_chunk`
- `complete_route`

Typical action bundles:

- `commit + complete_chunk`
- `hold + clarify`
- `reject + repair`
- `hold + pending_recovery`

## Output contracts

### Commit

Use only when:

- intent is legal;
- required fields are present;
- guards pass;
- state mutation is explicit and bounded.

### Reject

Use when:

- proposal is unsupported, stale, or contradictory;
- assistant footer mismatches user event;
- a direct mutation would violate invariants.

### Repair

Use when:

- route needs re-anchoring;
- footer is absent in a test lane;
- side question return failed;
- stale packet or stale event was detected.

### Hold

Use when:

- more clarification is needed;
- silence/ambiguity should not mutate state;
- recovery is pending;
- a side question was answered and the route must remain unchanged until explicitly resumed.

### Complete

Two separate completion scopes exist:

- chunk completion
- route completion

Chunk completion never implies advancement by itself.

## Invariant scoring

Primary scoring target is invariants, not exact prose.

Core invariants:

- one active route at a time
- one active chunk at a time
- `done` completes but does not advance
- `move_on` advances exactly one chunk
- `stuck` does not advance
- `continue` keeps the active chunk
- side questions restore the route
- no hidden state is invented
- final route completion occurs only after legal transitions
- recovery signals do not directly mutate committed state

## Smartness budget levels

### Level 0

Deterministic rule only.

Examples:

- field presence checks
- intent vocabulary checks
- event dedupe
- version monotonicity

### Level 1

Bounded inference over a narrow ambiguity.

Examples:

- mapping `next` to `move_on`
- mapping `yeah` only when a single option was active

### Level 2

Cadence/confidence control without semantic autonomy.

Examples:

- shortening response in `fast_physical`
- downshifting to confirmation at a risky boundary

### Level 3

Repair intelligence.

Examples:

- building a re-anchor packet
- detecting the smallest legal recovery move

### Level 4

Workflow planning intelligence.

Examples:

- Mermaid route compilation
- fixture generation from fail/recover rows

### Level 5

Gated autonomy.

Examples:

- trusted automatic surface selection
- background resumption proposals

Milestone 5 designs Levels 0–4 only. Level 5 remains future and gated.

## When LLM intelligence is allowed

Allowed boundary uses:

- compile a broad need into a small Mermaid route
- interpret user wording into supported intent proposals
- propose a repair packet
- suggest chunking or re-chunking
- propose cadence style

Every such use remains advisory until reducer guards approve it.

## What the LLM must not control

The LLM must not:

- become the committed state authority
- invent completion
- advance on `done`
- treat side questions as route switches automatically
- decide auto-submit behavior
- read or infer protected browser state
- override safety gates

## How failure rows map to guards and skill logic

The fail/recover map supplies:

- `Reducer_Guard_or_State_Rule` → candidate reducer guard names
- `Skill_Logic_to_Inject` → candidate narrow skill blocks
- `Suggested_Test` → workflow fixture seed
- `Severity`, `Likelihood`, `Detection_Confidence` → prioritization inputs
- `Confidence_Cadence_Mode` → smartness/cadence tuning hints

Mapping examples:

- `F047` → `done_vs_move_on_guard` + `done_vs_move_on` skill
- `F048` → `side_question_return_guard` + `answer_then_return` skill
- `F067` → `footer_is_proposal` guard
- `F073` → `event_queue_priority` guard

## Audit loop after every transition

Every reducer transition should eventually support this audit record:

- prior `state_version`
- incoming signal type
- proposed action
- guards evaluated
- result: `commit`, `reject`, `repair`, or `hold`
- next `state_version`
- affected metrics rows

This audit loop is the basis for Milestone 6 fixture scoring.
