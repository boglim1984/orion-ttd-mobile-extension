# Legal Spreadsheet Comparative Analysis v1

This note compares the three legal spreadsheet artifacts that now sit under the Orion TTD legal framework.

## Fail/Recover Map v1

Question:
What failure class happened, what recovery mechanism should exist, and how do we prove the route survived?

Stack position:
after failure / scoring / precedent

Role:
case law

Influence layer:
- recovery design
- reducer guards
- workflow fixtures
- scorer categories
- metrics coverage

Feeds tests:
- workflow fixtures
- invariant checks
- repair-path tests
- coverage reporting

Produces language:
- repair mechanism names
- guard/test seed language
- failure-class labels

Must not override:
- committed reducer state
- scorer verdict implementation
- Constitution authority rules

Metrics:
- failures covered
- failures observed
- recoveries defined
- recoveries tested
- unresolved failures

## Pre-Collapse Steering Language Matrix v1

Question:
What language should bias the LLM before the event collapses into a reducer/scorer outcome?

Stack position:
before LLM action / skill prompt layer

Role:
language law

Influence layer:
- skill blocks
- prompt packets
- cadence/confidence language
- assistant-response shaping

Feeds tests:
- assistant-behavior tests
- future prose/cadence scoring
- wording simulations

Produces language:
- framing phrases
- contextual steering packets
- cadence/confidence wording

Must not override:
- reducer authority
- scorer authority
- fail/recover precedent

Metrics:
- situation classes
- steering terms
- skill block reuse
- simulation coverage

## LLM Legal Deference Map v1

Question:
When should the LLM's semantic interpretation, safety judgment, empathy, planning, or conflict detection be granted legal weight before reducer commit?

Stack position:
interpretation boundary / Judge and validator-adjacent layer

Role:
deference law

Influence layer:
- Judge packets
- Script Judge prompts
- semantic-intent classifiers
- stale-log conflict handling
- safety holds
- ambiguity handling

Feeds tests:
- deference boundary tests
- semantic classifier tests
- stale-log vs current-evidence tests
- safety-hold and reanchor tests

Produces language:
- deference standards
- Judge prompts
- Script Judge question scaffolds
- safety/hold packet language

Must not override:
- committed reducer state
- reducer/scorer executable authority
- Constitution authority law

Metrics:
- deference cases covered
- standards exercised
- boundary tests passed
- safe HOLD/reanchor rates
- fail-gracefully escalations

## Updated Legal Taxonomy

Constitution v1
= constitution / authority law

Fail/Recover Map v1
= case law / failure precedent

Pre-Collapse Steering Language Matrix v1
= language law / skill-argument law

LLM Legal Deference Map v1
= deference law / interpretive authority map

Fail Gracefully / Human Witness Escalation
= live-witness escalation rule for unresolved turn failure

Reducer/scorer code
= executable authority

Judge packets
= legal interpreter when ambiguity is high

Script Judge
= fact-question examiner

Fail Gracefully
= phone-a-friend card / ask Billy when the system cannot lawfully know

## Most Important Boundary

LLM deference is not LLM sovereignty.

It can influence interpretation, classification, cadence, repair choice, or safety hold, but reducer validation is still required before state mutation.
