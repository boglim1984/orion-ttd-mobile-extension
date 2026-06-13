# Casework Evidence Digest

*Generated convenience digest. Raw JSON, reviews, indexes, and matrix remain the source evidence surfaces.*

## Why this exists

- Fresh planning chats should not choose the next study from `next_study_needed` alone.
- Use this digest to orient quickly, then inspect linked reviews, indexes, and raw evidence when planning the next suite.

## Active research brief

- Next study: route_law_minimal_field_ablation_v1
- Purpose: Find the smallest command packet field set that still preserves route law after route_law_contract_relaxation_matrix_v1 showed relaxed packets can preserve continue, done, move_on, and side-question return behavior.
- Current confidence: Confidence is now high that route law can survive relaxed response_contract wording, but medium/limited on which packet fields are actually carrying that behavior.
- Open gap: The current evidence does not yet isolate whether route survival depends on active_chunk_id, active_chunk_label, next_chunk_id, next_chunk_label, route_sequence, allowed_intents, or free-text route_law wording.
- Suite shape recommendation: Use 6 to 8 cases in one disposable chat. Mark the suite as ablation/matrix, preserve case order, and keep one late negative control.

## Evidence summary

- Imported run count: 8
- Imported case count: 41
- Matrix row count: 41
- Latest imported suite ID: route_law_contract_relaxation_matrix_v1
- Latest imported run ID: 20260613-153256-route_law_contract_relaxation_matrix_v1

## What appears proven

- Scorer keyword extraction v3 validation is complete with no open findings.
- The explicit route_law_language_expansion_v1 packet family passed continue hold, done hold, move_on advance, and side-question return behaviors.
- Variable suite size is now treated as evidence shape, not noise to flatten away.

## What remains fragile or under-tested

- Relaxed route-law packets may still fail even though strict response_contract packets passed.
- Label-only references and lighter completion wording are under-tested relative to explicit chunk-id packets.
- Late-suite negative controls are still sparse, so drift under carryover context remains only partially observed.

## Recent imported runs

- route_law_contract_relaxation_matrix_v1 / 20260613-153256-route_law_contract_relaxation_matrix_v1: 8 cases, legal=FAIL, route=broken, design=matrix, context_risk=high
- route_law_language_expansion_v1 / 20260613-145410-route_law_language_expansion_v1: 4 cases, legal=PASS, route=survived, design=contrast, context_risk=medium
- scorer_keyword_extraction_v3_fresh_validation / 20260613-142922-scorer_keyword_extraction_v3_fresh_validation: 2 cases, legal=FAIL, route=broken, design=smoke, context_risk=low

## Recent review files

- study/reviews/2026-06-13/scorer_keyword_extraction_v3_fresh_validation__20260613-142922-scorer_keyword_extraction_v3_fresh_validation.md
- study/reviews/2026-06-13/route_law_language_expansion_v1__20260613-145410-route_law_language_expansion_v1.md
- study/reviews/2026-06-13/route_law_contract_relaxation_matrix_v1__20260613-153256-route_law_contract_relaxation_matrix_v1.md

## Planning rule

- Small means focused, not shallow.
- Use four cases only for smoke checks, validator checks, or narrow regressions.
- For research suites, use the smallest set that can answer the question, often six to ten cases.
- Suite size, case order, and chat turn depth are experimental variables. Compare evidence by run shape, not just pass/fail totals.
