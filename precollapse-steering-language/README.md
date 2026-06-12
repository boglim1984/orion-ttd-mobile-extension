# Orion TTD Pre-Collapse Steering Language

This artifact tracks contextual steering language that can bias the LLM before a turn collapses into scored reducer outcomes.

## What it is

- a repo-tracked skill and prompt steering artifact
- a higher-layer context source above reducer pass/fail scoring
- a human-editable XLSX plus agent-friendly CSV, JSON, and JSONL derivatives

## How it differs from Fail/Recover Map v1

- `fail-recover-map/` is the failure, recovery, guard, and test layer
- `precollapse-steering-language/` is the skill and prompt language layer
- Fail/Recover Map answers what went wrong and how the system recovered
- Pre-Collapse Steering Language answers what wording should bias the model before the reducer/scorer judges the turn

Important architecture rule:

This artifact is above the LLM in the skill layer, not below the LLM in reducer state.

## Source and derivative formats

- the XLSX in `v1/` is the human-editable source artifact
- `v1/csv/` contains per-sheet CSV files
- `v1/json/` contains per-sheet JSON arrays
- `v1/jsonl/` contains per-sheet JSONL files

## Role in the system

This artifact feeds:

- skill injection language
- prompt packet wording
- cadence and confidence steering
- future assistant-response scoring design
- simulation and skill-block authoring

It does not:

- override reducer authority
- become runtime code by itself
- replace the Fail/Recover Map

## Read before

Agents should read this artifact before designing:

- skill logic blocks
- contextual steering packets
- cadence or confidence wording
- assistant-behavior tests
- future skill-library prompt rules
