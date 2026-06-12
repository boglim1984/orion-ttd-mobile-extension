# Milestone 6A Doc And Fixture Alignment Report

## Status

Completed as a pre-coding alignment pass for Milestone 6.

## Files Changed

- `ttdmobile_coding_rulebook.md`
- `docs/ORION_TTD_COMMAND_PROTOCOL_V0.md`
- `docs/ORION_TTD_REDUCTION_HARNESS_V0.md`
- `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
- `test-fixtures/workflows/desk-reset-v0.json`
- `test-fixtures/workflows/side-question-return-v0.json`
- `test-fixtures/workflows/recover-turn-v0.json`
- `reports/milestone-6a-doc-fixture-alignment-report.md`

## What Was Normalized

- `active_chunk_id` is now the canonical reducer-facing fixture state field.
- `active_chunk_label` is used for readable chunk naming in fixture state where useful.
- `route_status` is now explicit in fixture state templates where route lifecycle matters.

## Final Route Completion Policy Chosen

The desk-reset fixture now uses an explicit terminal route event:

- final user `done` completes the final chunk only
- final `done` does not route-complete
- a separate `terminal_commit` event performs `complete_route`

This keeps `done` vs `move_on` clean while making route completion machine-auditable.

## How `return_to_route` Is Classified

`return_to_route` is now documented as a reducer-handled recovery or system event, not as part of the narrow core user-intent set.

Current split:

- core user intents: `done`, `move_on`, `continue`, `stuck`, `pause`, `re_chunk`
- recovery/system events: `side_question`, `return_to_route`, `recovery_signal`, `terminal_commit`

## Build-Stamp Language Correction

The rulebook now states that DOM-visible page stamps, such as dataset attributes on `document.documentElement`, are the preferred verification contract.

Page globals may still exist for debugging, but they are no longer described as the preferred verification path.

## Runtime Change Confirmation

- no reducer code added
- no scorer code added
- no fixture runner code added
- no content-script or runtime behavior changed
- no version or update metadata changed

## Next Step

Milestone 6B: implement the pure Orion reducer with a validation boundary and compact audit records, still without scorer work or Orion runtime changes.
