# Orion TTD Smartness Budget V0

Status: Milestone 5 design artifact  
Scope: intelligence allocation rule

## Purpose

Define how much intelligence is allowed at each boundary.

The rule is simple:

- use the smallest intelligence level needed;
- keep deterministic control where possible;
- spend intelligence at semantic boundaries, not state-authority boundaries.

## Budget levels

### Level 0 — deterministic rule

Use when a fixed rule is enough.

Examples:

- intent vocabulary check
- version mismatch reject
- one-active-chunk enforcement
- required footer presence in test mode

### Level 1 — bounded inference

Use for a narrow interpretation with low blast radius.

Examples:

- map `next` to `move_on`
- map `yeah` only when a single option is active
- detect a simple side question class

### Level 2 — cadence/confidence control

Use when the meaning is known but pacing/friction needs adjustment.

Examples:

- shorten response for physical cleanup
- require confirmation for risky completion
- lower question count under frustration

### Level 3 — repair intelligence

Use when the route must be re-anchored after mismatch or drift.

Examples:

- generate `TTD_REPAIR_V1`
- decide between `hold`, `clarify`, and `repair`
- restore active route after side question

### Level 4 — workflow planning

Use for compile-time route or fixture generation.

Examples:

- Mermaid route compilation
- fixture generation from fail/recover rows
- mapping failures to guard/test coverage

### Level 5 — gated autonomy

Use only with explicit trusted mode and future approval.

Examples:

- autonomous surface selection
- autonomous multi-step resumption
- unattended action execution

Milestone 5 documents this level but does not implement it.

## Feature declaration rule

Every future feature should declare:

- required smartness level
- why lower levels are insufficient
- which reducer guards still constrain it
- what fail/recover rows justify the intelligence spend

## Boundary rule

Allowed high-smartness zones:

- need interpretation
- route compilation
- repair phrasing
- cadence selection

Disallowed high-smartness zones:

- state authority
- final commit decision
- unsupported intent upgrade
- unsafe action permission

## How Fail/Recover Map v1 informs smartness

The fail/recover map answers:

- where deterministic rules are enough
- where bounded inference is acceptable
- where repair intelligence is necessary
- where smartness should be reduced because the risk is too high

Examples:

- `F047` (`done` vs `move_on`) implies Level 0 guard plus maybe Level 1 paraphrase mapping, not Level 4 autonomy
- `F048` (side-question return) implies Level 2/3 route restoration
- `F055` and `F056` imply Level 2 cadence control
- `F067` implies reducer authority must stay at Level 0

## Budget examples by surface

- dataset build-stamp verification: Level 0
- command packet validation: Level 0
- intent paraphrase mapping: Level 1
- fast/slow response mode selection: Level 2
- repair packet construction: Level 3
- Mermaid route generation: Level 4
- autonomous background resumption: Level 5 and gated

## Milestone 5 policy

For the current Orion TTD repo:

- runtime extension behavior remains effectively Level 0
- protocol/reducer design supports Levels 0–4 conceptually
- no Level 5 runtime autonomy is introduced
- pre-collapse steering vocabulary may inform higher-layer cadence/confidence wording, but reducer authority remains deterministic
- `legal-framework/v1/ORION_TTD_STATE_HARNESS_CONSTITUTION_V1.md` defines why ambiguity can use legal language while committed-state authority stays with the reducer
