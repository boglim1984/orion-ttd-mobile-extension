# Orion TTD Command Protocol V0

Status: Milestone 5 design artifact  
Scope: protocol design only, no runtime actuation changes

## Purpose

Define the smallest protocol contract between:

- packet memory carried through the ChatGPT UI air gap;
- the assistant response footer;
- the local reducer that decides what is allowed to commit;
- the repair path used when a response is incomplete, unsafe, or state-destructive.

The protocol is deliberately narrow. The LLM may help interpret meaning, but it is not state authority.

## Core principle

- Orion extension = actuator/observer through the ChatGPT UI air gap.
- Packets = working memory.
- Reducer/state machine = committed-state authority.
- LLM = semantic helper, intent interpreter, repair assistant.
- Manual page-visible testing remains the default posture until reducer-backed fixtures pass.

## Packet families

### `TTD_COMMAND_V1`

Sent into ChatGPT as the active command packet.

Purpose:

- expose the current committed route state;
- constrain legal next-turn behavior;
- state the cadence/confidence posture;
- make commit and repair policy explicit.

### `TTD_RESPONSE_V1`

Returned by the assistant as a structured footer proposal.

Purpose:

- propose one legal interpretation of the latest turn;
- declare the intended state effect;
- give the reducer something mechanical to score;
- remain subordinate to reducer guard checks.

### `TTD_REPAIR_V1`

Generated when the response is missing, unsafe, stale, under-specified, or route-breaking.

Purpose:

- restate the current committed route;
- explain the exact mismatch briefly;
- re-anchor the next legal turn;
- avoid hidden state mutation.

## `TTD_COMMAND_V1` fields

Required fields:

- `protocol`: `TTD_COMMAND_V1`
- `command_id`: unique ID for this outgoing turn
- `state_version`: monotonic committed state version
- `session_id`: current harness session
- `route_id`: active route
- `active_goal`: current route goal
- `active_chunk_id`: canonical chunk ID
- `active_chunk_label`: human-readable chunk label
- `chunk_index`: zero-based or one-based index, but fixed per route
- `phase`: one of `active`, `hold`, `repair`, `paused`, `complete`
- `allowed_intents`: legal next-turn intents only
- `completion_condition`: observable rule for current chunk completion
- `cadence_mode`: current cadence policy
- `confidence_bias`: current confidence posture
- `commit_policy`
- `repair_policy`
- `safety_gates`
- `page_posture`

Optional fields:

- `parked_branches`
- `recent_events`
- `notes_for_repair`
- `pending_recovery`
- `partial_progress_policy`
- `max_repair_attempts`

## `TTD_RESPONSE_V1` footer

The assistant footer is a proposal, not authority.

Required fields:

- `protocol`: `TTD_RESPONSE_V1`
- `command_id`
- `state_version_seen`
- `interpreted_intent`
- `proposed_action`
- `target_chunk_id`
- `advance`
- `complete_current_chunk`
- `complete_route`
- `needs_repair`
- `confidence`
- `cadence_mode`
- `safety_result`
- `assistant_text_contract`

Allowed `proposed_action` values:

- `hold`
- `clarify`
- `commit_done`
- `commit_move_on`
- `commit_continue`
- `commit_pause`
- `commit_re_chunk`
- `commit_return_to_route`
- `emit_repair`

The footer must stay small enough for deterministic reducer scoring.

## `TTD_REPAIR_V1` fields

Required fields:

- `protocol`: `TTD_REPAIR_V1`
- `repair_id`
- `triggering_command_id`
- `trigger_type`
- `current_route_id`
- `current_chunk_id`
- `state_version`
- `mismatch_summary`
- `reanchor_text`
- `allowed_next_intents`
- `submit_mode`

`submit_mode` defaults to `disabled`.

## Core user intents

Initial canonical user-intent set for Milestone 5 fixtures:

- `done`
- `move_on`
- `continue`
- `stuck`
- `pause`
- `re_chunk`

These are the core user-control intents the reducer should expect from direct check-in turns.

## Recovery and system event classes

These are reducer-recognized event classes, not part of the narrow core user-intent vocabulary:

- `side_question`
- `return_to_route`
- `recovery_signal`
- `terminal_commit`

Interpretation rule:

- `side_question` represents an interruption branch that should not directly mutate committed route progress;
- `return_to_route` represents a recovery or restoration event that reanchors the prior route;
- `recovery_signal` represents a signal surface, not committed state authority;
- `terminal_commit` is the explicit legal route-completion event after final chunk conditions are already satisfied.

The reducer may map synonyms to this set, but unsupported intents never commit directly.

## Confidence and cadence fields

`cadence_mode` examples:

- `fast_physical`
- `slow_decision`
- `low_confidence_recovery`
- `contextual_confidence`

`confidence_bias` examples:

- `high_if_low_risk`
- `confirm_if_state_mutating`
- `repair_before_commit`
- `one_question_only`

These fields shape assistant style, but the reducer still enforces legality.

## Commit policy

The command packet must explicitly state:

- the assistant may propose but not commit;
- only reducer-approved transitions update state;
- unsupported or ambiguous transitions resolve to `hold`, `clarify`, or `repair`;
- final route completion requires legal prior transitions.

### `done` vs `move_on`

Canonical rule:

- `done` marks the current chunk complete only.
- `done` does not advance.
- `move_on` or `next` advances exactly one chunk.
- after `move_on`, the assistant must name the new active chunk.
- route completion remains separate and requires a later legal `terminal_commit` or equivalent explicit terminal reducer effect.

Example:

- current chunk: `clear trash`
- Billy says `done`
- legal result: `clear trash` becomes complete, `active_chunk_id` remains `chunk_01_clear_trash` until a later `move_on`
- Billy says `move_on`
- legal result: `active_chunk_id` becomes `chunk_02_collect_dishes`, and the assistant names `collect dishes`

## Repair policy

Repairs are required when:

- footer is missing in a test lane;
- `command_id` mismatches;
- `state_version` is stale;
- the assistant advances on `done`;
- the assistant loses the route after a side question;
- the assistant invents completion/progress;
- the response implies unsafe action or hidden automation.

Repair rules:

- restore the last committed route and active chunk;
- keep repair text short and user-readable;
- name the next legal move;
- do not mutate state through repair text alone.

## Safety gates

Every packet should name its active safety gates.

Initial gates:

- no hidden state authority in the LLM
- no auto-submit by default
- no private-data scraping
- no credentials/tokens/session reads
- no unlisted state completion
- no unsupported intent commit

## Page-visible/manual-test posture

Until Milestone 6 reducer scoring exists locally:

- page-visible dataset stamps remain the primary extension verification path;
- protocol scoring is fixture-first and repo-local;
- manual and semi-manual workflow tests are valid design inputs;
- runtime extension behavior stays inert outside build-stamp visibility.

## Minimal packet sketch

```text
TTD_COMMAND_V1
command_id: cmd_001
state_version: 7
session_id: session_desk_reset_01
route_id: desk-reset-v0
active_goal: reset the desk enough to choose the next work item
active_chunk_id: chunk_02_collect_dishes
active_chunk_label: collect dishes
chunk_index: 2
phase: active
allowed_intents: [done, stuck, continue, move_on, pause, re_chunk]
completion_condition: dishes gathered off the desk surface
cadence_mode: fast_physical
confidence_bias: high_if_low_risk
commit_policy: reducer_authority_only
repair_policy: reanchor_on_mismatch
safety_gates: [no_hidden_state, no_auto_submit, no_private_data]
page_posture: manual_visible_test
```

## Response footer sketch

```text
TTD_RESPONSE_V1
command_id: cmd_001
state_version_seen: 7
interpreted_intent: done
proposed_action: commit_done
target_chunk_id: chunk_02_collect_dishes
advance: false
complete_current_chunk: true
complete_route: false
needs_repair: false
confidence: 0.86
cadence_mode: fast_physical
safety_result: pass
assistant_text_contract: brief_ack_then_wait_for_move_on
```
