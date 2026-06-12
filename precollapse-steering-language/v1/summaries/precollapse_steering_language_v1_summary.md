# Pre-Collapse Steering Language v1 Summary

## Status

Integrated into the Orion TTD mobile extension repo as a tracked source artifact with CSV, JSON, and JSONL derivatives.

## Row Counts

- Dashboard: 8
- Steering_Matrix: 144
- Lexicon: 30
- Skill_Blocks: 12
- Simulations: 60
- Sources: 8

## Core Thesis

Pre-collapse steering language is the contextual layer that biases how the LLM resolves ambiguity before the reducer or scorer collapses the event into `PASS`, `PASS_WITH_REPAIR`, or `FAIL`.

## Role In The Architecture

- above the LLM in the skill and prompt layer
- upstream of reducer and scorer judgment
- useful for shaping boundary language before state authority decides outcome

## Relationship To Fail/Recover Map v1

- Fail/Recover Map v1 is the failure, recovery, guard, and test map
- Pre-Collapse Steering Language Matrix v1 is the skill and prompt language map
- the two artifacts complement each other but live at different layers

## Relationship To Milestone 6 Scorer

- Milestone 6 scorer names the outcome after reducer behavior is evaluated
- this matrix suggests language that may improve those outcomes before collapse
- it should inform future assistant-response scoring expansions, not replace reducer scoring

## Relationship To Future Milestone 7+

- it can guide command-packet wording and insert-only prompt language in Milestone 7
- it can seed future skill blocks and contextual steering packets
- it can help tune cadence and confidence language without moving state authority into the LLM

## Recommended Uses

- contextual prompt framing
- ambiguity steering
- route-preservation language
- skill-block prompt vocabulary
- simulation and test-language design

## Non-goals

- not runtime code
- not reducer authority
- not scorer authority
- not a substitute for fail/recover guards or fixture tests

## Metrics Role

This artifact tracks:

- situation classes
- steering terms
- reusable skill blocks
- simulations that may improve pass or fail outcomes before the reducer judges the turn

The legal synthesis layer that treats this matrix as language law now lives in `legal-framework/README.md`.
