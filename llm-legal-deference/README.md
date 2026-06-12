# Orion TTD LLM Legal Deference Map

This artifact tracks the interpretive-deference layer for cases where LLM judgment deserves legal weight before reducer commit.

## What It Is

- a repo-tracked deference-law / interpretive-authority spreadsheet artifact
- a human-editable XLSX plus agent-friendly CSV, JSON, and JSONL derivatives
- a map for cases where semantic interpretation, safety judgment, empathy/cadence, planning, or conflict detection should outrank rigid literal parsing or stale/partial logs

Required framing:

The LLM Legal Deference Map answers when the LLM's semantic interpretation should be treated as stronger evidence than rigid literal parsing or stale/partial logs, while still requiring reducer validation before committed state changes.

## How It Differs From Existing Artifacts

- `fail-recover-map/` is the failure, recovery, precedent, guard, and test layer
- `precollapse-steering-language/` is the upstream language and skill-argument layer before collapse
- `llm-legal-deference/` is the interpretive-deference layer at the ambiguity boundary near Judge packets, semantic classifiers, and conflict resolution

## Authority Boundary

- it does not make LLM prose committed state
- it does not override reducer code or tests
- reducer/scorer remain executable authority
- it defines when LLM interpretation deserves legal weight before reducer commit

## Source And Derivative Formats

- the XLSX in `v1/` is the human-editable source artifact
- `v1/csv/` contains per-sheet CSV files
- `v1/json/` contains per-sheet JSON arrays
- `v1/jsonl/` contains per-sheet JSONL files

## Why It Belongs In The Legal Framework

- Constitution v1 defines authority, evidence, claims, legal moves, and amendment flow
- Fail/Recover Map v1 names failure precedent and recovery/test obligations
- Pre-Collapse Steering Language Matrix v1 shapes wording before collapse
- this artifact defines when the LLM may lawfully win interpretation without becoming sovereign over state

## Read Before

Agents should read this artifact before designing:

- Judge packets
- ambiguous-intent handling
- semantic-intent classifiers
- safety overrides
- user-correction handling
- cadence/confidence rules
- LLM-vs-log conflict resolution
