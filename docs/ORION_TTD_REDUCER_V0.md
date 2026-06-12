# Orion TTD Reducer V0

Status: Milestone 6B local implementation artifact  
Scope: pure reducer and validation boundary only

## Purpose

Define the first local Orion-native reducer that applies the Milestone 5 plus 6A contract against workflow fixtures without changing Orion runtime behavior.

## Reducer API

Current local module surface:

- `src/reducer/index.js`
- `buildReducerStateFromFixture(fixture)`
- `validateReducerEvent(event, state)`
- `applyReducerEvent(state, event)`

`applyReducerEvent` returns:

```js
{
  ok: true | false,
  validation: {},
  state: {},
  reducer_effect: "string",
  result: "commit" | "reject" | "hold" | "repair" | "complete",
  audit_record: {}
}
```

## Validator Boundary

Validation happens before reducer mutation.

Current checks:

- event shape
- `event_id` presence
- known event type
- route match when event route is supplied
- session match when event session is supplied
- stale-event refusal via `state_version_seen`
- duplicate-event refusal via `last_event_id` and processed IDs
- core user intent vs recovery/system event distinction
- allowlisted intent/event membership from state

Refused events do not mutate authoritative reducer state.

## State Shape

Reducer-facing state uses:

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
- `reducer_event_types`
- `phase`
- `last_committed_action`
- `last_event_id`
- `cadence_mode`
- `confidence_bias`
- `pending_recovery`
- `parked_side_questions`
- `completion_condition`
- `chunk_completion`
- `processed_event_ids`

## Supported Events

Core user intents:

- `continue`
- `done`
- `move_on`
- `stuck`
- `pause`
- `re_chunk`

Reducer/system events:

- `start`
- `side_question`
- `return_to_route`
- `recovery_signal`
- `repair_packet`
- `terminal_commit`

`next` is normalized into `move_on` at the validator boundary.

## Guard List

Current guard vocabulary:

- `event_shape_guard`
- `event_id_guard`
- `known_event_type_guard`
- `route_id_guard`
- `session_id_guard`
- `stale_event_guard`
- `event_dedupe_guard`
- `intent_scope_guard`
- `allowed_intent_guard`
- `single_active_chunk_guard`
- `done_vs_move_on_guard`
- `pending_recovery_guard`
- `terminal_commit_guard`
- `no_invented_progress_guard`

## Reducer Effects

Current reducer effects include:

- `hold_active_chunk`
- `keep_active_chunk`
- `hold_and_help`
- `complete_chunk_no_advance`
- `complete_chunk_no_route_complete_until_legal_terminal_commit`
- `advance_exactly_one_chunk`
- `answer_then_restore_route`
- `construct_repair_packet_without_commit`
- `reanchor_route_keep_submit_disabled`
- `complete_route`
- `reject`

## Audit Record Shape

Each application returns an audit record with:

- `event_id`
- `prior_state_version`
- `next_state_version`
- `route_id`
- `active_chunk_id_before`
- `active_chunk_id_after`
- `event_type`
- `normalized_intent`
- `event_class`
- `guards_evaluated`
- `guard_results`
- `reducer_effect`
- `result`
- `refusal_reason`
- `notes`

## Design Lineage

This reducer borrows:

- older TTD safety patterns for validation, refusal, dedupe, and explicit route/chunk discipline
- advanced Skill Injector vocabulary for proposal vs commit separation, validation-first architecture, and compact audit traces

It remains Orion-native:

- workflow fixtures define the contract
- reducer state is authoritative
- assistant/proposal language never commits state directly

See `legal-framework/v1/ORION_TTD_STATE_HARNESS_CONSTITUTION_V1.md` for the legal framing that keeps reducer authority above prose, signals, and extension observation.
See `llm-legal-deference/v1/summaries/llm_legal_deference_map_v1_summary.md` for the narrower standards that may influence interpretation without moving commit authority out of the reducer.

## Non-goals

- no scorer yet
- no fixture-runner reporting layer yet
- no Orion content-script changes
- no composer insertion
- no submit behavior
- no task watcher or Voice Mode probing
- no extension update metadata changes

## Runtime Status

Milestone 6B adds only local reducer code, local tests, and local docs. Orion runtime behavior is unchanged.
