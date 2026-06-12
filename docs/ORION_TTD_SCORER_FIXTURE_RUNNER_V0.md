# Orion TTD Scorer And Fixture Runner V0

Status: Milestone 6C local implementation artifact  
Scope: invariant scorer and workflow-fixture runner only

## Purpose

Turn the pure Orion reducer into a measurable local workflow-test harness.

Milestone 6C adds:

- event-level invariant scoring against fixture expectations
- a local runner for all workflow fixtures
- machine-readable and Markdown run reports

## Scorer API

Current local module:

- `src/reducer/scorer.js`

Primary functions:

- `scoreReducerEvent({ fixture, event, priorState, reducerOutput })`
- `summarizeScoredEvents(eventResults)`

## Fixture Runner Usage

Current local surfaces:

- `src/reducer/fixtureRunner.js`
- `scripts/run-workflow-fixtures.mjs`

Run:

```bash
node scripts/run-workflow-fixtures.mjs
```

The script:

- loads all workflow fixtures
- builds initial reducer state
- applies every trial event through validator plus reducer
- scores every event
- writes JSON and Markdown reports
- exits nonzero if any unexpected fail category occurs

## Scoring Categories

Supported in Milestone 6C:

- `PASS`
- `PASS_WITH_REPAIR`
- `FAIL_ADVANCED_WITHOUT_PERMISSION`
- `FAIL_INVENTED_STATE`
- `FAIL_LOST_ROUTE`
- `FAIL_REPAIR_DID_NOT_REANCHOR`

Reserved for later assistant/DOM-aware scoring:

- `FAIL_TOO_MANY_QUESTIONS`
- `FAIL_UNSAFE_ACTION`
- `FAIL_NO_RESPONSE_CONTRACT`
- `FAIL_CADENCE_TOO_FAST`
- `FAIL_CADENCE_TOO_SLOW`

These remain reserved because Milestone 6C scores reducer behavior only, not assistant prose, pacing, or runtime DOM actuation.

## Report Output Schema

JSON report keys:

- `generated_at`
- `fixture_count`
- `total_events`
- `pass_count`
- `pass_with_repair_count`
- `fail_count`
- `reserved_category_count`
- `reserved_categories`
- `per_fixture_results`
- `per_event_results`
- `audit_records`
- `failure_rows_covered`
- `scorer_version`

Markdown summary includes:

- run status
- fixture and event totals
- pass/fail counts
- invariant summary
- reserved categories
- fixture status list
- failure list when present

## Connection To Fail/Recover Map v1

The fixture runner preserves `failure_rows_covered` from each workflow fixture and carries them into the aggregated report. This makes the local reducer harness measurable against the Fail/Recover Map baseline before any Orion runtime packet insertion work begins.

## Connection To Milestone 7

Milestone 6C is the measurable local harness step before Milestone 7.

Milestone 7 can build on this by introducing command-packet insertion smoke in the Orion extension while keeping:

- insert-only behavior
- no submit
- no runtime state authority shift

## Safety Boundary

Milestone 6C is local logic only:

- no Orion runtime changes
- no content-script behavior changes
- no composer insertion
- no submit behavior
- no update metadata changes
