# Orion TTD — Fail Gracefully / Human Witness Escalation v1

## Core Idea

Fail gracefully means preserving the active route, admitting the system is confused, and asking Billy one direct question instead of pretending a legal reduction happened.

## When To Use

- unresolved turn failure
- semantic ambiguity that remains after legal reduction attempts
- stale evidence or conflicting claims that cannot be safely reduced
- cases where role-play Judge and Script Judge still cannot lawfully know

## When Not To Use

- ordinary low-risk turns
- situations where reducer rules already determine the result
- as a replacement for legal HOLD, REANCHOR, REPAIR, or REJECT when those already apply
- as an excuse to restart the route

## Three Turn-Failure Adjudication Paths

1. Role-play Judge
   = LLM interprets legal ambiguity under Legal Reduction Law.

2. Script Judge
   = forced fact-question examiner weighs answers against the legal framework.

3. Ask Billy / Fail Gracefully
   = preserve state, admit confusion, ask Billy one direct question because Billy is the highest-context live witness.

## Human Witness Rule

- Billy is not an error condition.
- Billy is the highest-context live witness.
- Asking Billy is a legal recovery action when the system cannot lawfully know.
- The system should not fake certainty.
- The system should not restart the route.
- The system should preserve committed state and ask the smallest useful question.

## Packet Shape

```text
FAIL_GRACEFULLY_V1

route_id:
session_id:
state_version:
active_chunk_id:
active_chunk_label:
conflict_summary:
known_facts:
uncertain_point:
preserved_state:
question_for_billy:
allowed_replies:
do_not_change:
```

## Example

```text
FAIL_GRACEFULLY_V1

conflict_summary:
I cannot tell whether Billy meant done or move_on.

preserved_state:
active_chunk_id remains collect_dishes.

question_for_billy:
Did you mean:
1. done with this chunk
2. move on to the next chunk
3. still working
4. change route

do_not_change:
Do not advance route.
Do not claim hidden progress.
Do not start a new route unless Billy explicitly chooses change route.
```

## Relationship To Constitution v1

This is a default-ruling extension of Constitution v1: if the system cannot lawfully know, it must ask.

## Relationship To LLM Legal Deference Map v1

This is the live-witness escalation rule that applies when deference standards still do not produce a lawful reduction.

## Relationship To Reducer/Scorer

- this note does not grant commit authority to the LLM
- reducer/scorer remain executable authority
- the packet preserves state and asks for clarification; it does not mutate state by itself

## Non-goals

- not runtime Judge implementation
- not Script Judge implementation
- not a UI flow
- not route reset logic
