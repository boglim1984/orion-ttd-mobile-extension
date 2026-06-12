# Orion TTD Workflow Tests V0

Status: Milestone 5 design artifact  
Scope: fixture and scoring design only

## Purpose

Define the first fixture-driven optimization loop for the Orion TTD harness.

Workflow tests exist to answer:

- does the protocol contract stay intact under real interaction patterns?
- do reducer invariants hold across routine and drifted turns?
- which fail/recover rows are covered, repaired, unresolved, or regressed?

## Workflow fixture schema

Each workflow fixture should contain:

- `fixture_version`
- `route_id`
- `goal`
- `description`
- `source_context`
- `chunks`
- `allowed_intents`
- `state_template`
- `trial_events`
- `assertions`
- `failure_rows_covered`
- `scoring_profile`
- `smartness_budget`

## Trial event schema

Each trial event should contain:

- `event_id`
- `type`
- `actor`
- `utterance` or `signal`
- `expected_interpreted_intent`
- `expected_reducer_effect`
- `expected_active_chunk_id`
- `notes`

Valid event types include:

- `start`
- `continue`
- `done`
- `move_on`
- `stuck`
- `pause`
- `re_chunk`
- `side_question`
- `return_to_route`
- `recovery_signal`
- `repair_packet`

## Invariant assertions

Core assertion families:

- state does not advance illegally
- one active chunk remains authoritative
- route and chunk restoration works after interruptions
- repair packets re-anchor instead of mutating silently
- no hidden state is invented
- route completion requires legal prior chunk transitions

Assertions should be machine-readable where possible and human-auditable otherwise.

## Scoring categories

Initial categories:

- `PASS`
- `PASS_WITH_REPAIR`
- `FAIL_ADVANCED_WITHOUT_PERMISSION`
- `FAIL_INVENTED_STATE`
- `FAIL_LOST_ROUTE`
- `FAIL_TOO_MANY_QUESTIONS`
- `FAIL_UNSAFE_ACTION`
- `FAIL_NO_RESPONSE_CONTRACT`
- `FAIL_CADENCE_TOO_FAST`
- `FAIL_CADENCE_TOO_SLOW`
- `FAIL_REPAIR_DID_NOT_REANCHOR`

## PASS semantics

### `PASS`

All target invariants hold without needing a repair turn.

### `PASS_WITH_REPAIR`

The initial proposal was imperfect, but the harness emitted a legal repair and restored the route without unsafe mutation.

## Fail class semantics

### `FAIL_ADVANCED_WITHOUT_PERMISSION`

The harness or assistant advanced the route/chunk without a legal `move_on` transition.

### `FAIL_INVENTED_STATE`

The system claimed completion, progress, or route mutation not supported by user signal or verified surface.

### `FAIL_LOST_ROUTE`

The response answered locally but did not restore `route_id` and `active_chunk`.

### `FAIL_TOO_MANY_QUESTIONS`

The response overloaded the user rather than choosing the smallest legal clarification.

### `FAIL_UNSAFE_ACTION`

The design implied hidden automation, unsafe submission, or illegal surface authority.

### `FAIL_NO_RESPONSE_CONTRACT`

The assistant response could not be scored against the response footer or equivalent contract.

### `FAIL_CADENCE_TOO_FAST`

The system over-inferred or over-advanced at a risky boundary.

### `FAIL_CADENCE_TOO_SLOW`

The system stalled a low-risk or obvious chunk with needless friction.

### `FAIL_REPAIR_DID_NOT_REANCHOR`

The repair text existed but did not restore the legal active route/chunk.

## How to derive tests from Fail/Recover Map v1

Use these source columns:

- `Failure_ID`
- `Layer`
- `Failure_Event`
- `Early_Detection_Signals`
- `Recovery_Mechanism`
- `Skill_Logic_to_Inject`
- `Reducer_Guard_or_State_Rule`
- `Confidence_Cadence_Mode`
- `Suggested_Test`

Derivation process:

1. group rows by workflow-relevant boundary
2. select high-severity or high-likelihood rows first
3. convert each row into one or more trial events
4. convert reducer guard text into invariant assertions
5. convert recovery mechanism text into expected repair behavior
6. tag the resulting fixture with the covered `Failure_ID`s

## How test results update metrics

Each scored run should eventually update:

- failure rows covered by at least one fixture
- failures observed in real or semi-manual runs
- recoveries defined
- recoveries tested
- unresolved failures
- coverage by layer
- coverage by severity
- coverage by cadence mode
- coverage by skill block

## Manual vs semi-manual vs automated

### Manual

Human executes the turn on real Orion iOS and records observed results.

Use for:

- device-only extension update checks
- real UI timing quirks
- Web Inspector verification

### Semi-manual

Human provides the turn or response, but the fixture and scoring contract already exist locally.

Use for:

- done vs move_on
- side-question return
- cadence/friction boundary checks

### Automated

A local reducer/scorer replays the fixture deterministically against event payloads and response proposals.

Use for:

- state guards
- footer validity
- event dedupe
- stale version rejection

## Fixture authoring rule

Every nontrivial workflow fixture should include:

- one happy path
- one interruption or ambiguity path
- one repair or hold path

That keeps the harness honest against the fail/recover baseline instead of optimizing only for the happy path.
