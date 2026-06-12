# LLM Legal Deference Map v1 Summary

## Status

Integrated into the Orion TTD mobile extension repo as a tracked source artifact with CSV, JSON, and JSONL derivatives.

## Row Counts

- Dashboard: 8
- LLM_Wins_Cases: 192
- Legal_Standards: 25
- Boundary_Tests: 72
- Skill_Blocks: 20
- Simulations: 96
- Sources: 8

## Core Thesis

The LLM may win interpretation, language, cadence, safety, planning, or conflict detection, but never silent committed state.

## Role In The Architecture

- sits at the interpretation boundary near Judge packets and validator-adjacent reasoning
- grants legal weight to semantic interpretation under explicit standards
- helps the system choose between lawful commit, hold, reanchor, reject, or repair without treating prose as state

## Relationship To Constitution v1

- Constitution v1 defines authority law, evidence law, claim boundaries, default HOLD, and reducer/scorer supremacy
- this map fills in the narrower question of when LLM interpretation may receive legal deference before reducer commit
- it supports the Constitution without overriding it

## Relationship To Fail/Recover Map v1

- Fail/Recover Map v1 is case law, failure precedent, recovery design, and test-seed baseline
- this map explains when interpretation should beat rigid deterministic literalism during ambiguity
- the two artifacts complement each other: fail map names the failure class, deference map names when semantic interpretation deserves weight

## Relationship To Pre-Collapse Steering Language Matrix v1

- Pre-Collapse Steering Language Matrix v1 is language law and upstream skill/prompt steering
- this map is deference law and applies at the interpretation boundary when evidence conflicts or literal parsing is too weak
- the matrix shapes language before collapse; this map decides when LLM interpretation should be trusted within legal bounds

## Relationship To Judge Role

- the Judge is one natural consumer of these standards
- legal standards, boundary tests, and skill blocks in this workbook can shape Judge packets and Script Judge prompts
- the Judge may interpret, but the reducer still validates and commits

## Relationship To Milestone 6 Reducer/Scorer

- Milestone 6 reducer/scorer remain executable authority
- this map may guide future semantic classifier tests, ambiguity handling, safety holds, and repair-path packet wording
- it must not move commit authority out of the reducer

## Relationship To Future Milestone 7+

- it can guide packet wording where semantic nuance matters
- it can inform ambiguous-intent handling and legal HOLD behavior during insert-only packet experiments
- it can seed future Judge, Script Judge, and semantic-boundary fixtures without changing runtime authority

## Fail Gracefully / Human Witness Escalation

This is the third adjudication path after Role-play Judge and Script Judge.

- use it only during turn failure or unresolved legal ambiguity
- preserve committed state
- ask Billy one direct question as the highest-context live witness
- use it when semantic ambiguity, stale evidence, or conflicting claims cannot be safely reduced
- it supports LLM deference without giving the LLM commit authority

## Recommended Uses

- Judge packet design
- Script Judge question design
- semantic-intent classifier boundaries
- stale-log vs current-evidence conflict handling
- safety-hold packet wording
- empathy/cadence guardrails
- ambiguity and deference fixture generation

## Non-goals

- not committed reducer state
- not scorer authority
- not runtime code
- not silent auto-commit logic
- not a justification for overriding legal route boundaries

## Metrics Role

This artifact should support metrics for:

- deference cases covered by tests
- standards exercised by fixtures
- boundary tests passed vs held vs rejected
- cases where stale logs were demoted correctly
- cases where safety holds beat route momentum
- cases escalated to Fail Gracefully / Human Witness Escalation
