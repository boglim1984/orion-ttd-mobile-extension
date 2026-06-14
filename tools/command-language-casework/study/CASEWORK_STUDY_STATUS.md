# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_fresh_context_minimum_carrier_isolation_v1_retry_split_8case_suites
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: fresh_min_carrier_001_protocol_only held with no route or active chunk. | fresh_min_carrier_002_route_id_only held because active_chunk_id was absent. | fresh_min_carrier_003_active_id_only advanced to collect_dishes only after route_id had already appeared in the same chat. | fresh_min_carrier_012_wrong_next_trap_with_active_id ignored stack_papers and advanced to collect_dishes inside the contaminated same-chat context. | fresh_min_carrier_018_explicit_legal_successor_sanity advanced to collect_dishes as expected.
**Current confidence**: medium
**Open gap**: Still unknown which fields are sufficient when each packet is evaluated as the first meaningful route packet in a fresh disposable chat. The run produced strong carryover evidence but did not cleanly isolate active_chunk_id-only, route_id+active_chunk_id, activation_frame+route_id+active_chunk_id, or wrong-next behavior in fresh context.
**Test strategy**: Generate validator-ready 8-case suites. Every suite contains at least 8 cases. The carrier candidate under test appears at case 001 and the suite is run in a fresh disposable ChatGPT chat. Interpret the case 001 result as clean fresh-context carrier evidence. Cases 002-008 provide tail controls, sanity checks, and carryover observations.
**Avoid / do not repeat**: Do not run all carrier candidates as one multi-case suite when measuring fresh-context minimum carrier. | Do not interpret later active_chunk_id-only advancement as fresh active_chunk_id-only authority if route_id appeared earlier in the same chat. | Do not expose route_sequence. | Do not expose legal_successor_chunk_id before the final sanity control. | Do not treat PASS_CANDIDATE as sufficient when the expected behavior was hold. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 10 to 12 validator-ready 8-case suites. Every suite starts with a different carrier candidate at case 001, followed by seven support cases. Candidate-first coverage should include protocol marker without route fields, route_id without active_chunk_id, active_chunk_id without route_id, route_id plus active_chunk_id, active_chunk_id plus label without route_id, damaged allowed_intents, wrong-next with active_id, wrong-next without active_id, activation_frame plus route_id plus active_id, and explicit legal_successor sanity.
**Retirement condition**: Retire when first-position isolated runs show whether route_id+active_chunk_id advances, whether route_id-only/active-only/label-only/no-route packets hold, whether wrong next_chunk_id is consistently ignored in fresh context, whether damaged allowed_intents blocks move_on, and whether explicit legal_successor still passes.
**Next action for fresh chat**: Generate validator-ready 8-case suite JSON objects with the target carrier candidate at case 001. Avoid wrapper packs. Every suite object must be directly pasteable into the Casework GUI and must contain at least 8 cases.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_fresh_context_minimum_carrier_isolation_v1 result 20260614-135754-route_law_fresh_context_minimum_carrier_isolation_v1.
**Set by**: Billy / ChatGPT post-run review
**Set at**: 2026-06-14

### Why these cases
- The previous pointer is satisfied because relaxed contracts preserved route law.
- The next uncertainty is the minimal field carrier, not strict versus relaxed wording.
- A late negative control remains necessary so reduced packets do not teach the scorer to accept wrong-next movement.

## Artifact roles

- Raw result JSON = evidence
- Reflection review = interpretation
- Case-law matrix = cumulative analysis
- Evidence digest = planning convenience surface
- Legal system = authority/evidence language
- Study status = agenda
- Rulebook = agent behavior

## Open integration question

- Collapse or redesign overlapping artifacts if they become duplicate sources of truth.

## Computed summary
Generated from raw result files.

- Last tabulated at: 2026-06-14T18:14:08.824Z
- Run count: 35
- Case count: 405
- Latest suite ID: route_law_fresh_context_minimum_carrier_isolation_v1
- Latest run ID: 20260614-135754-route_law_fresh_context_minimum_carrier_isolation_v1
- Classification counts: {"PASS_CANDIDATE":289,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":30,"HOLD_NEEDS_REVIEW":85}
- Open findings count: 0
- Case-law matrix rows: 405

## Open findings
Generated and/or manually curated.

*(No open findings)*

## Recently resolved findings
Generated from casework status cleanup.

- **casework_reflection_loop_missing_001** (resolved): Reflection loop validation and derived-artifact regeneration are now in place.
- **casework_window_model_miscount_001** (resolved): Casework docs and runner flow now treat design chat, local GUI, and disposable ChatGPT test tab as distinct surfaces.
- **casework_case_law_matrix_missing_001** (resolved): The cumulative case-law matrix is now generated from imported runs.
- **casework_legal_system_not_integrated_001** (resolved): Legal verdict and route-survival fields are now part of derived casework outputs.
- **casework_artifact_overlap_risk_001** (resolved): Status, matrix, review, and raw evidence roles are now explicitly separated in the study artifacts.
- **scorer_collect_dishes_false_lost_route_001** (resolved): The collect_dishes scorer repair landed and historical rows now recompute correctly.