# Milestone 5 Reduction Harness Design Report

## Status

Milestone 5 is complete as a repo-local design-and-fixtures milestone.

## Files created

- `docs/ORION_TTD_COMMAND_PROTOCOL_V0.md`
- `docs/ORION_TTD_REDUCTION_HARNESS_V0.md`
- `docs/ORION_TTD_WORKFLOW_TESTS_V0.md`
- `docs/ORION_TTD_MERMAID_PLANNING_RULE_V0.md`
- `docs/ORION_TTD_SMARTNESS_BUDGET_V0.md`
- `test-fixtures/workflows/desk-reset-v0.json`
- `test-fixtures/workflows/side-question-return-v0.json`
- `test-fixtures/workflows/recover-turn-v0.json`
- `reports/milestone-5-reduction-harness-design-report.md`

## How Fail/Recover Map v1 was used

- `failure_map.csv` supplied failure classes, guard candidates, recovery mechanisms, cadence hints, and suggested tests.
- `workflow_tests.csv` supplied the first desk-reset, side-question, recovery, cadence, and slice-test vocabulary.
- `skill_blocks.csv` informed the narrow-skill posture instead of broad manifesto injection.
- `scoring_rubric.csv` informed reducer-first scoring language rather than prose matching.

## How Mermaid planning was captured

- Mermaid is now documented as the route-design language between Billy’s plain-language need and the compiled harness artifacts.
- The docs define how Mermaid becomes `route_id`, chunks, guards, packet fields, recovery paths, fixtures, and metrics tags.
- Examples were added for `done` vs `move_on`, side-question return, and recovery-signal re-anchoring.

## How smartness budget was captured

- Levels 0–5 are now explicitly defined in repo-local docs.
- The design keeps state authority deterministic while allowing bounded intelligence at semantic boundaries such as route compilation and repair.
- The fail/recover map is now treated as one of the main inputs for deciding how much smartness is justified.

## What is now ready for Milestone 6

- command protocol contract
- reducer authority and invariant model
- workflow fixture schema
- three first canonical workflow fixtures
- smartness budget vocabulary
- Mermaid-first planning rule
- repo-local docs for future scorer/reducer implementation

## What remains intentionally unimplemented

- no composer insertion runtime
- no submit behavior
- no task watcher
- no Voice Mode probing
- no reducer runtime implementation
- no invariant scorer runtime implementation
- no Orion runtime behavior changes

## Next recommended milestone

Milestone 6 — implement local reducer/invariant scorer against the workflow fixtures, with no Orion runtime changes yet.
