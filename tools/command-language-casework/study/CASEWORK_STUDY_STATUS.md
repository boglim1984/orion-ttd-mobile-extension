# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_explicit_active_carrier_floor_confirmation_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_sequence_only_no_active_001_cold_sequence_only held with no active chunk instead of inferring clear_trash from the first route_sequence item. | route_law_sequence_only_no_active_002 through 004 showed wrong next_chunk_id and next_chunk_label did not produce legal movement when no active carrier existed. | route_law_sequence_only_no_active_005 through 007 showed next_chunk-only packets are not sufficient route-law evidence and also held without active state. | route_law_sequence_only_no_active_008 through 012 repeated the no-active-chunk result late in the suite, including rotated and shortened route_sequence probes.
**Current confidence**: high
**Open gap**: We now know route_sequence alone is not enough. The remaining minimum-carrier question is which explicit active carrier is sufficient and stable: active_chunk_id, active_chunk_label, both together, and whether route_sequence is still required when an active carrier is present.
**Test strategy**: Run a focused cold-first confirmation suite using explicit active carriers and no response_contract or route_law rescue wording. Include active_chunk_id-only, active_chunk_label-only, both active fields, active plus route_sequence, and wrong-next conflicts. Add late retests to detect carryover drift.
**Avoid / do not repeat**: do not repeat route_sequence-only no-active packets except as a single negative control if needed | do not include response_contract | do not include route_law rescue wording | do not treat next_chunk-only collect_dishes as proof of route-law survival | do not mix this with broad language expansion | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 12-case focused confirmation suite: cold active_id-only, cold active_label-only, both-active, active plus route_sequence, wrong-next conflicts, next-only negative control, and late retests.
**Retirement condition**: Retire this pointer when the explicit active carrier floor is characterized: active_chunk_id-only, active_chunk_label-only, both-active, and active-plus-route_sequence variants are clearly classified for legal move_on under cold and late wrong-next conditions.
**Next action for fresh chat**: Generate a validator-ready suite for route_law_explicit_active_carrier_floor_confirmation_v1 focused on explicit active carriers as the minimum legal move_on anchor after route_sequence-only failed to infer active state.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_sequence_only_no_active_carrier_v1 result 20260613-185251-route_law_sequence_only_no_active_carrier_v1.
**Set by**: Billy / ChatGPT post-run review
**Set at**: 2026-06-13

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

- Last tabulated at: 2026-06-13T22:58:34.736Z
- Run count: 17
- Case count: 95
- Latest suite ID: route_law_sequence_only_no_active_carrier_v1
- Latest run ID: 20260613-185251-route_law_sequence_only_no_active_carrier_v1
- Classification counts: {"PASS_CANDIDATE":68,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5,"HOLD_NEEDS_REVIEW":21}
- Open findings count: 0
- Case-law matrix rows: 95

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